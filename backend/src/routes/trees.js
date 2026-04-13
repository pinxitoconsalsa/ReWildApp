const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();

// GET /api/trees/user
router.get('/user', authMiddleware, async (req, res) => {
  const trees = await prisma.tree.findMany({
    where: { userId: req.user.id },
    orderBy: { plantedAt: 'desc' },
  });
  res.json(trees);
});

// GET /api/trees/:id
router.get('/:id', authMiddleware, async (req, res) => {
  const tree = await prisma.tree.findUnique({ where: { id: req.params.id } });
  if (!tree || tree.userId !== req.user.id) return res.status(404).json({ error: 'Not found' });
  res.json(tree);
});

// POST /api/trees
router.post('/', authMiddleware, async (req, res) => {
  const { name, scientificName, locationName, lat, lng, co2PerYear, photoUrl } = req.body;
  const tree = await prisma.tree.create({
    data: { userId: req.user.id, name, scientificName, locationName, lat, lng, co2PerYear: co2PerYear || 0.2, photoUrl },
  });
  // Award XP
  await prisma.user.update({ where: { id: req.user.id }, data: { xp: { increment: 100 } } });
  res.status(201).json(tree);
});

module.exports = router;
