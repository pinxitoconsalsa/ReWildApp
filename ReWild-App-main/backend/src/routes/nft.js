const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();

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

  const prefix = tree.scientificName.slice(0, 3).toUpperCase();
  const tokenId = `${prefix}-${String(Date.now()).slice(-3)}-${tree.name.slice(0, 4).toUpperCase()}`;
  const txHash = '0x' + uuidv4().replace(/-/g, '');

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

  res.status(201).json(cert);
});

module.exports = router;
