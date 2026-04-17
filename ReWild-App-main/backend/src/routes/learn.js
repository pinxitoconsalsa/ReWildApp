const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();

// GET /api/learn/courses?category=Reforestacion
router.get('/courses', async (req, res) => {
  const { category } = req.query;
  const where = category && category !== 'Todo' ? { category } : {};
  const courses = await prisma.course.findMany({ where, orderBy: { price: 'asc' } });
  res.json(courses);
});

// POST /api/learn/courses/:id/purchase
router.post('/courses/:id/purchase', authMiddleware, async (req, res) => {
  const course = await prisma.course.findUnique({ where: { id: req.params.id } });
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const existing = await prisma.coursePurchase.findUnique({
    where: { userId_courseId: { userId: req.user.id, courseId: course.id } },
  });
  if (existing) return res.status(409).json({ error: 'Already purchased' });

  const purchase = await prisma.coursePurchase.create({
    data: { userId: req.user.id, courseId: course.id },
  });
  // Award XP for free courses on enroll
  if (course.price === 0) {
    await prisma.user.update({ where: { id: req.user.id }, data: { xp: { increment: 50 } } });
  }
  res.status(201).json(purchase);
});

module.exports = router;
