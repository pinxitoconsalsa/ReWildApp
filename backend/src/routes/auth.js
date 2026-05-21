const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { supabase } = require('../lib/supabase');
const prisma = require('../lib/prisma');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Espera 15 minutos.' },
});

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
  const { email, password, name, bio } = req.body;
  if (!email || !password || !name)
    return res.status(400).json({ error: 'email, password, name required' });
  if (password.length < 6)
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });

  try {
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (authError) throw authError;
    if (!authData.user) return res.status(400).json({ error: 'Failed to create user' });

    // Create user record in PostgreSQL
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { id: authData.user.id, email, name, bio: bio || '' },
      });
    }

    // Return Supabase session
    res.json({
      session: authData.session,
      user: { id: user.id, email: user.email, name: user.name, rank: user.rank, xp: user.xp },
    });
  } catch (err) {
    if (err.message?.includes('already registered')) {
      return res.status(409).json({ error: 'Este email ya está registrado' });
    }
    res.status(400).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;

  try {
    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) return res.status(401).json({ error: 'Invalid credentials' });

    // Get user data from PostgreSQL
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'User not found in database' });
    }

    res.json({
      session: authData.session,
      user: { id: user.id, email: user.email, name: user.name, rank: user.rank, xp: user.xp },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(401).json({ error: 'Credenciales inválidas' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) throw error;
    res.json({ session: data.session });
  } catch (err) {
    console.error('Refresh error:', err.message);
    res.status(401).json({ error: 'Token de refresco inválido o expirado' });
  }
});

module.exports = router;
