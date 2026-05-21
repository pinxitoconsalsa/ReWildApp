const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { checkAndUnlockAchievements } = require('../lib/achievements');
const { uploadToSupabase } = require('../lib/supabase-upload');
const prisma = require('../lib/prisma');

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
  const { name, scientificName, locationName, lat, lng, co2PerYear, photoBase64 } = req.body;

  if (!name || !scientificName || !locationName || lat == null || lng == null) {
    return res.status(400).json({ error: 'Faltan campos: name, scientificName, locationName, lat, lng' });
  }

  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);
  if (isNaN(parsedLat) || isNaN(parsedLng) || parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180) {
    return res.status(400).json({ error: 'Coordenadas inválidas' });
  }

  const parsedCo2 = parseFloat(co2PerYear);
  const safeCo2 = (!isNaN(parsedCo2) && parsedCo2 > 0 && parsedCo2 <= 100) ? parsedCo2 : 0.2;

  let photoUrl = null;

  if (photoBase64) {
    try {
      const filename = `trees/${req.user.id}-${Date.now()}.jpg`;
      const buffer = Buffer.from(photoBase64, 'base64');
      photoUrl = await uploadToSupabase('rewild-images', filename, buffer, 'image/jpeg');
    } catch (err) {
      return res.status(400).json({ error: 'Failed to upload photo' });
    }
  }

  try {
    // Creación de árbol y XP en una sola transacción
    const [tree] = await prisma.$transaction([
      prisma.tree.create({
        data: {
          userId: req.user.id,
          name: String(name).slice(0, 100),
          scientificName: String(scientificName).slice(0, 100),
          locationName: String(locationName).slice(0, 150),
          lat: parsedLat,
          lng: parsedLng,
          co2PerYear: safeCo2,
          photoUrl,
        },
      }),
      prisma.user.update({ where: { id: req.user.id }, data: { xp: { increment: 100 } } }),
    ]);
    checkAndUnlockAchievements(req.user.id).catch(console.error);
    res.status(201).json(tree);
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar el árbol' });
  }
});

module.exports = router;
