const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { uploadToSupabase } = require('../lib/supabase-upload');
const { supabase } = require('../lib/supabase');

const prisma = new PrismaClient();

// XP thresholds per rank
const RANKS = [
  { name: 'Semilla',         minXP: 0    },
  { name: 'Brote',           minXP: 200  },
  { name: 'Árbol Joven',     minXP: 500  },
  { name: 'Casi Guardián',   minXP: 1000 },
  { name: 'Guardián',        minXP: 1500 },
  { name: 'Guardián Maestro',minXP: 3000 },
];

function calcProgress(xp) {
  let current = RANKS[0], next = RANKS[1];
  for (let i = 0; i < RANKS.length - 1; i++) {
    if (xp >= RANKS[i].minXP && xp < RANKS[i + 1].minXP) {
      current = RANKS[i]; next = RANKS[i + 1]; break;
    }
    if (xp >= RANKS[RANKS.length - 1].minXP) {
      current = RANKS[RANKS.length - 1]; next = null; break;
    }
  }
  const xpInLevel = next ? xp - current.minXP : 0;
  const xpNeeded  = next ? next.minXP - current.minXP : 1;
  const xpToNext  = next ? next.minXP - xp : 0;
  const pct       = next ? Math.round((xpInLevel / xpNeeded) * 100) : 100;
  return { rank: current.name, nextRank: next?.name, xp, xpToNext, progressPct: pct };
}

// GET /api/user/progress
router.get('/progress', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const trees  = await prisma.tree.count({ where: { userId: user.id } });
  const events = await prisma.eventJoin.count({ where: { userId: user.id } });
  const co2    = await prisma.tree.aggregate({ where: { userId: user.id }, _sum: { co2PerYear: true } });

  res.json({
    ...calcProgress(user.xp),
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    bio: user.bio || '',
    metrics: {
      trees,
      co2Kg: Math.round((co2._sum.co2PerYear || 0) * 1000),
      events,
    },
  });
});

// PATCH /api/user/profile
router.patch('/profile', authMiddleware, async (req, res) => {
  const { name, bio, avatarBase64 } = req.body;
  const data = {
    ...(name !== undefined && { name }),
    ...(bio !== undefined && { bio }),
  };

  // Handle avatar upload if provided
  if (avatarBase64) {
    try {
      const filename = `avatars/${req.user.id}-${Date.now()}.jpg`;
      const buffer = Buffer.from(avatarBase64, 'base64');
      const publicUrl = await uploadToSupabase('rewild-images', filename, buffer, 'image/jpeg');
      data.avatarUrl = publicUrl;
    } catch (err) {
      return res.status(400).json({ error: 'Failed to upload avatar: ' + err.message });
    }
  }

  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data,
  });
  res.json({ name: updated.name, bio: updated.bio, avatarUrl: updated.avatarUrl });
});

// PATCH /api/user/email
router.patch('/email', authMiddleware, async (req, res) => {
  const { newEmail } = req.body;
  if (!newEmail) return res.status(400).json({ error: 'newEmail required' });
  if (newEmail === req.user.email) {
    return res.status(400).json({ error: 'El nuevo email debe ser diferente' });
  }

  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Este email ya está en uso' });
    }

    // Update email in PostgreSQL
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { email: newEmail },
    });

    // Try to update in Supabase Auth (best effort - don't fail if it doesn't work)
    try {
      await supabase.auth.admin.updateUserById(req.user.id, {
        email: newEmail,
        email_confirm: true,
      });
    } catch (supabaseErr) {
      console.warn('Warning: Could not update email in Supabase Auth, but PostgreSQL was updated:', supabaseErr.message);
    }

    res.json({ email: updated.email, message: 'Email actualizado correctamente' });
  } catch (err) {
    console.error('Error updating email:', err);
    res.status(400).json({ error: err.message || 'Error al cambiar email' });
  }
});

module.exports = router;
