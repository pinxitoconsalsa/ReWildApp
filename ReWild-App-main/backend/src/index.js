require('dotenv').config();
const express = require('express');
const cors = require('cors');

process.on('uncaughtException', (err) => { console.error('UNCAUGHT:', err); process.exit(1); });
process.on('unhandledRejection', (err) => { console.error('UNHANDLED:', err); process.exit(1); });

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/trees', require('./routes/trees'));
app.use('/api/learn', require('./routes/learn'));
app.use('/api/community', require('./routes/community'));
app.use('/api/events', require('./routes/events'));
app.use('/api/nft', require('./routes/nft'));
app.use('/api/carbon', require('./routes/carbon'));
app.use('/api/map', require('./routes/map'));

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => console.log(`ReWild API running on :${PORT}`));

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Puerto ${PORT} en uso. Ejecuta esto en PowerShell y vuelve a intentar:\n`);
    console.error(`   Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force\n`);
    process.exit(1);
  } else {
    throw err;
  }
});
