require('dotenv').config();
require('express-async-errors'); // captura errores async en routes sin try-catch
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { initSupabaseBucket } = require('./lib/supabase-init');

process.on('uncaughtException',  (err) => { console.error('UNCAUGHT EXCEPTION:', err.stack || err); });
process.on('unhandledRejection', (err) => { console.error('UNHANDLED REJECTION:', err?.stack || err); });

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

const app = express();
app.use(helmet({
  crossOriginResourcePolicy: false,      // API pública: permite fetch cross-origin
  contentSecurityPolicy: false,          // no aplica a APIs JSON
}));
app.use(cors({
  origin: (origin, cb) => {
    // allow server-to-server (no origin) and whitelisted origins
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '6mb' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/trees', require('./routes/trees'));
app.use('/api/learn', require('./routes/learn'));
app.use('/api/community', require('./routes/community'));
app.use('/api/events', require('./routes/events'));
app.use('/api/nft', require('./routes/nft'));
app.use('/api/carbon', require('./routes/carbon'));
app.use('/api/map', require('./routes/map'));
app.use('/api/achievements', require('./routes/achievements'));

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// Global error handler — captura cualquier error de routes async
app.use((err, req, res, next) => {
  console.error(`[${req.method} ${req.path}]`, err.message);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`ReWild API running on :${PORT}`);
  initSupabaseBucket();
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Puerto ${PORT} en uso. Ejecuta esto en PowerShell y vuelve a intentar:\n`);
    console.error(`   Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force\n`);
    process.exit(1);
  } else {
    throw err;
  }
});
