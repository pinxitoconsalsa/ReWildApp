const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

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
    avatarUrl: user.avatarUrl,
    metrics: {
      trees,
      co2Kg: Math.round((co2._sum.co2PerYear || 0) * 1000),
      events,
    },
  });
});

module.exports = router;
