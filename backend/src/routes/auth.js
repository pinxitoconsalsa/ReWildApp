const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sign = (user) =>
  jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name)
    return res.status(400).json({ error: 'email, password, name required' });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, passwordHash, name } });
  res.json({ token: sign(user), user: { id: user.id, email: user.email, name: user.name, rank: user.rank, xp: user.xp } });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  res.json({ token: sign(user), user: { id: user.id, email: user.email, name: user.name, rank: user.rank, xp: user.xp } });
});

// POST /api/auth/social  — stub for Google / Apple
router.post('/social', async (req, res) => {
  const { provider, providerId, email, name } = req.body;
  if (!provider || !email) return res.status(400).json({ error: 'provider and email required' });

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({ data: { email, name: name || email, provider, providerId } });
  }
  res.json({ token: sign(user), user: { id: user.id, email: user.email, name: user.name, rank: user.rank, xp: user.xp } });
});

module.exports = router;
