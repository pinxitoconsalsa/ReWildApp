const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const authMiddleware = require('../middleware/auth');
const { checkAndUnlockAchievements } = require('../lib/achievements');
const prisma = require('../lib/prisma');

// GET /api/nft/my
router.get('/my', authMiddleware, async (req, res) => {
  const certs = await prisma.nFTCertificate.findMany({
    where: { userId: req.user.id },
    include: { tree: true },
    orderBy: { mintedAt: 'desc' },
  });
  res.json(certs);
});

// POST /api/nft/mint  { treeId }
router.post('/mint', authMiddleware, async (req, res) => {
  const { treeId } = req.body;
  if (!treeId) return res.status(400).json({ error: 'treeId required' });

  const tree = await prisma.tree.findUnique({ where: { id: treeId } });
  if (!tree || tree.userId !== req.user.id)
    return res.status(404).json({ error: 'Tree not found' });

  const existing = await prisma.nFTCertificate.findUnique({ where: { treeId } });
  if (existing) return res.status(409).json({ error: 'Already minted' });

  // tokenId: prefijo especie + UUID corto → garantía de unicidad
  const prefix = tree.scientificName.replace(/\s+/g, '').slice(0, 4).toUpperCase();
  const tokenId = `${prefix}-${uuidv4().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
  // txHash: hash simulado basado en treeId (determinista, no real blockchain)
  const txHash = '0x' + crypto.createHash('sha256').update(tree.id + Date.now()).digest('hex').slice(0, 40);

  const cert = await prisma.nFTCertificate.create({
    data: {
      userId: req.user.id,
      treeId: tree.id,
      tokenId,
      lat: tree.lat,
      lng: tree.lng,
      co2PerYear: tree.co2PerYear,
      txHash,
    },
    include: { tree: true },
  });

  // Award XP
  await prisma.user.update({ where: { id: req.user.id }, data: { xp: { increment: 200 } } });
  checkAndUnlockAchievements(req.user.id).catch(console.error);

  res.status(201).json(cert);
});

module.exports = router;
