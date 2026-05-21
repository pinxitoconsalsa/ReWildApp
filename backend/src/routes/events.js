const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { checkAndUnlockAchievements } = require('../lib/achievements');
const prisma = require('../lib/prisma');

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

  try {
    await prisma.$transaction(async (tx) => {
      // Verificar duplicado
      const existing = await tx.eventJoin.findUnique({
        where: { userId_eventId: { userId: req.user.id, eventId: event.id } },
      });
      if (existing) {
        const err = new Error('Already joined'); err.code = 'ALREADY_JOINED'; throw err;
      }

      // Incrementar solo si quedan spots (atomic compare-and-update)
      const updated = await tx.event.updateMany({
        where: { id: event.id, joinedSpots: { lt: event.totalSpots } },
        data: { joinedSpots: { increment: 1 } },
      });

      if (updated.count === 0) {
        const err = new Error('Event is full'); err.code = 'EVENT_FULL'; throw err;
      }

      await tx.eventJoin.create({ data: { userId: req.user.id, eventId: event.id } });
      await tx.user.update({ where: { id: req.user.id }, data: { xp: { increment: 150 } } });
    });

    checkAndUnlockAchievements(req.user.id).catch(console.error);
    res.json({ message: 'Joined successfully' });
  } catch (err) {
    if (err.code === 'ALREADY_JOINED') return res.status(409).json({ error: 'Ya estás inscrito en este evento' });
    if (err.code === 'EVENT_FULL')    return res.status(409).json({ error: 'El evento está completo' });
    if (err.code === 'P2002')         return res.status(409).json({ error: 'Ya estás inscrito en este evento' });
    res.status(500).json({ error: 'Error al unirse al evento' });
  }
});

module.exports = router;
