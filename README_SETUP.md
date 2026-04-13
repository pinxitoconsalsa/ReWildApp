# ReWild App — Setup

## Prerequisites
- Node.js 18+
- PostgreSQL running locally

---

## 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env → set DATABASE_URL with your postgres credentials

npm install
npx prisma migrate dev --name init
node src/prisma/seed.js   # seeds demo data
npm run dev               # runs on :3001
```

Demo login after seed:
- Email: `demo@rewild.app`
- Password: `demo1234`

---

## 2. Frontend

```bash
cd frontend
npm install
npm run dev    # runs on :5173
```

Vite proxies `/api` → `localhost:3001` automatically.

---

## Folder structure

```
ReWild-App/
├── backend/
│   ├── prisma/schema.prisma        # DB models
│   ├── src/
│   │   ├── index.js                # Express entry
│   │   ├── middleware/auth.js      # JWT middleware
│   │   ├── prisma/seed.js          # Demo data
│   │   └── routes/
│   │       ├── auth.js             # POST /api/auth/login|register|social
│   │       ├── user.js             # GET  /api/user/progress
│   │       ├── trees.js            # GET  /api/trees/user
│   │       ├── learn.js            # GET  /api/learn/courses
│   │       ├── community.js        # GET  /api/community/feed
│   │       ├── events.js           # GET  /api/events
│   │       ├── nft.js              # POST /api/nft/mint
│   │       ├── carbon.js           # POST /api/carbon/calculate
│   │       └── map.js              # GET  /api/map/impact
└── frontend/
    └── src/
        ├── screens/
        │   ├── Onboarding.jsx      # Screen 01 — Login/Register
        │   ├── Dashboard.jsx       # Screen 02 — Dashboard
        │   ├── Aprende.jsx         # Screen 03 — Courses
        │   ├── Comunidad.jsx       # Screen 04 — Community feed
        │   ├── Acciones.jsx        # Screen 05 — Events
        │   ├── Certificados.jsx    # Screen 06 — NFT certs
        │   ├── Calculadora.jsx     # Screen 07 — CO2 calculator
        │   └── Mapa.jsx            # Screen 08 — Impact map
        ├── context/AuthContext.jsx
        ├── lib/api.js              # All API calls
        └── components/Layout.jsx   # Bottom nav
```

---

## Notes

- **Map**: Replace the placeholder in `Mapa.jsx` with Mapbox GL JS or Google Maps.
- **Social OAuth**: Stubs in `/api/auth/social` — wire real Google/Apple tokens.
- **Payments**: Course purchases are tracked DB-side; add Stripe for real payments.
- **NFT / Blockchain**: `txHash` is a stub UUID. Integrate with Polygon/Ethereum provider (e.g. Alchemy + ethers.js) to write actual on-chain transactions.
