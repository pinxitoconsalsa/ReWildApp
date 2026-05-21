const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { checkAndUnlockAchievements } = require('../lib/achievements');
const { uploadToSupabase } = require('../lib/supabase-upload');

const prisma = new PrismaClient();

function timeAgo(date) {
  const secs = Math.floor((Date.now() - new Date(date)) / 1000);
  if (secs < 60)   return `Hace ${secs}s`;
  if (secs < 3600) return `Hace ${Math.floor(secs / 60)}min`;
  if (secs < 86400) return `Hace ${Math.floor(secs / 3600)}h`;
  return `Hace ${Math.floor(secs / 86400)}d`;
}

// GET /api/community/feed
router.get('/feed', async (req, res) => {
  const posts = await prisma.communityPost.findMany({
    include: { user: { select: { name: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  res.json(posts.map(p => ({
    ...p,
    timeAgo: timeAgo(p.createdAt),
  })));
});

// POST /api/community/posts
router.post('/posts', authMiddleware, async (req, res) => {
  const { content, category, title, imageBase64 } = req.body;
  if (!content) return res.status(400).json({ error: 'content required' });

  let imageUrl = null;

  // Handle image upload if provided
  if (imageBase64) {
    try {
      const filename = `community/${req.user.id}-${Date.now()}.jpg`;
      const buffer = Buffer.from(imageBase64, 'base64');
      imageUrl = await uploadToSupabase('rewild-images', filename, buffer, 'image/jpeg');
    } catch (err) {
      return res.status(400).json({ error: 'Failed to upload image: ' + err.message });
    }
  }

  const post = await prisma.communityPost.create({
    data: {
      userId: req.user.id,
      type: 'USER',
      category: category || 'GENERAL',
      title,
      content,
      imageUrl,
    },
  });
  // Award XP
  await prisma.user.update({ where: { id: req.user.id }, data: { xp: { increment: 20 } } });
  checkAndUnlockAchievements(req.user.id).catch(console.error);
  res.status(201).json(post);
});

// POST /api/community/posts/:id/like
router.post('/posts/:id/like', authMiddleware, async (req, res) => {
  const post = await prisma.communityPost.update({
    where: { id: req.params.id },
    data: { likes: { increment: 1 } },
  });
  res.json({ likes: post.likes });
});

module.exports = router;
