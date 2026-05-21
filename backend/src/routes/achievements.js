const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { ACHIEVEMENTS, checkAndUnlockAchievements } = require('../lib/achievements');
const prisma = require('../lib/prisma');

// GET /api/achievements — lista completa con estado desbloqueado para el usuario
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Auto-check on fetch so achievements are always up to date
    await checkAndUnlockAchievements(req.user.id);

    const unlocked = await prisma.userAchievement.findMany({
      where: { userId: req.user.id },
    });

    const unlockedMap = Object.fromEntries(
      unlocked.map(u => [u.achievementId, u.unlockedAt])
    );

    const result = ACHIEVEMENTS.map(a => ({
      id: a.id,
      label: a.label,
      description: a.description,
      emoji: a.emoji,
      unlocked: Boolean(unlockedMap[a.id]),
      unlockedAt: unlockedMap[a.id] || null,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener logros' });
  }
});

module.exports = router;
