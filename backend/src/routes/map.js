const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /api/map/impact
router.get('/impact', async (req, res) => {
  const metric = await prisma.impactMetric.findFirst();
  const projects = await prisma.mapProject.findMany({ where: { isActive: true } });

  res.json({
    stats: metric || { totalTrees: 1200000, totalCO2Kg: 240000000, totalSites: 45, totalCommunities: 120 },
    projects,
  });
});

// GET /api/map/projects/search?q=Amazonas
router.get('/projects/search', async (req, res) => {
  const { q } = req.query;
  const projects = await prisma.mapProject.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { region: { contains: q, mode: 'insensitive' } },
        { country: { contains: q, mode: 'insensitive' } },
      ],
    },
  });
  res.json(projects);
});

module.exports = router;
