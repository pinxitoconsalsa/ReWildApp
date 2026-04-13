const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();

// GET /api/events?category=Reforestacion
router.get('/', async (req, res) => {
  const { category } = req.query;
  const where = category && category !== 'Todo' ? { category } : {};
  const events = await prisma.event.findMany({
    where,
    orderBy: [{ isFeatured: 'desc' }, { date: 'asc' }],
  });

  res.json(events.map(e => ({
    ...e,
    availableSpots: e.totalSpots - e.joinedSpots,
    status: e.joinedSpots >= e.totalSpots ? 'COMPLETO' : 'OPEN',
  })));
});

// POST /api/events/:id/join
router.post('/:id/join', authMiddleware, async (req, res) => {
  const event = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (event.joinedSpots >= event.totalSpots)
    return res.status(409).json({ error: 'Event is full' });

  const existing = await prisma.eventJoin.findUnique({
    where: { userId_eventId: { userId: req.user.id, eventId: event.id } },
  });
  if (existing) return res.status(409).json({ error: 'Already joined' });

  await prisma.$transaction([
    prisma.eventJoin.create({ data: { userId: req.user.id, eventId: event.id } }),
    prisma.event.update({ where: { id: event.id }, data: { joinedSpots: { increment: 1 } } }),
    prisma.user.update({ where: { id: req.user.id }, data: { xp: { increment: 150 } } }),
  ]);

  res.json({ message: 'Joined successfully' });
});

module.exports = router;
