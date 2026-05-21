const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

// GET /api/map/impact
router.get('/impact', async (req, res) => {
  const projects = await prisma.mapProject.findMany({ where: { isActive: true } });

  // Calculate stats from real projects
  const totalTrees = projects.reduce((sum, p) => sum + p.treesPlanted, 0);
  const totalCommunities = projects.reduce((sum, p) => sum + p.communities, 0);
  const totalSites = projects.length;
  const totalCO2Kg = totalTrees * 20; // ~20kg CO2 per tree in lifetime

  res.json({
    stats: { totalTrees, totalCO2Kg, totalSites, totalCommunities },
    projects,
  });
});

// GET /api/map/projects/search?q=Amazonas
router.get('/projects/search', async (req, res) => {
  const { q } = req.query;
  const projects = await prisma.mapProject.findMany({
    where: {
      OR: [
        { name: { contains: q } },
        { region: { contains: q } },
        { country: { contains: q } },
      ],
    },
  });
  res.json(projects);
});

// POST /api/map/projects — crear nuevo proyecto
router.post('/projects', async (req, res) => {
  const { name, region, country, lat, lng, treesPlanted, jobsCreated, communities, description } = req.body;

  if (!name || !region || !country || lat == null || lng == null) {
    return res.status(400).json({ error: 'Faltan campos obligatorios: name, region, country, lat, lng' });
  }

  const project = await prisma.mapProject.create({
    data: {
      name,
      region,
      country,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      treesPlanted: parseInt(treesPlanted) || 0,
      jobsCreated: parseInt(jobsCreated) || 0,
      communities: parseInt(communities) || 0,
      description: description || null,
      isActive: true,
    },
  });

  res.status(201).json(project);
});

// GET /api/map/my-joins — ver qué proyectos ha joinado el usuario
router.get('/my-joins', auth, async (req, res) => {
  const joins = await prisma.projectJoin.findMany({
    where: { userId: req.user.id },
    select: { projectId: true },
  });
  res.json(joins.map(j => j.projectId));
});

// POST /api/map/join — usuario se une a un proyecto
router.post('/join', auth, async (req, res) => {
  const { projectId } = req.body;
  const userId = req.user.id;

  if (!projectId) {
    return res.status(400).json({ error: 'projectId requerido' });
  }

  try {
    const join = await prisma.projectJoin.create({
      data: { userId, projectId },
    });
    res.status(201).json(join);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Ya estás unido a este proyecto' });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/map/join/:projectId — usuario deja de seguir un proyecto
router.delete('/join/:projectId', auth, async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  try {
    await prisma.projectJoin.delete({
      where: {
        userId_projectId: { userId, projectId },
      },
    });
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'No estás unido a este proyecto' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
