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
│   └── src/
│       ├── index.js                # Express entry
│       ├── middleware/auth.js      # JWT middleware
│       ├── prisma/seed.js          # Demo data
│       └── routes/
│           ├── auth.js             # POST /api/auth/login|register|social
│           ├── user.js             # GET /api/user/progress · PATCH /api/user/profile
│           ├── trees.js            # GET /api/trees/user
│           ├── learn.js            # GET /api/learn/courses
│           ├── community.js        # GET /api/community/feed
│           ├── events.js           # GET /api/events
│           ├── nft.js              # POST /api/nft/mint
│           ├── carbon.js           # POST /api/carbon/calculate
│           └── map.js              # GET /api/map/impact
└── frontend/
    └── src/
        ├── screens/
        │   ├── Onboarding.jsx      # Screen 01 — Login/Register
        │   ├── Dashboard.jsx       # Screen 02 — Home dashboard
        │   ├── Aprende.jsx         # Screen 03 — Courses
        │   ├── Comunidad.jsx       # Screen 04 — Community feed
        │   ├── Acciones.jsx        # Screen 05 — Events
        │   ├── Certificados.jsx    # Screen 06 — NFT certs & trees
        │   ├── Calculadora.jsx     # Screen 07 — CO2 calculator
        │   ├── Mapa.jsx            # Screen 08 — Impact map
        │   ├── UserProfile.jsx     # Screen 09 — User profile (new)
        │   └── Settings.jsx        # Screen 10 — App settings (new)
        ├── context/AuthContext.jsx
        ├── lib/api.js              # All API calls
        └── components/Layout.jsx   # Bottom nav (4 tabs: Home · Map · User · Settings)
```

---

## Changelog

### Navigation & User Profile redesign
- **Layout.jsx** — Bottom nav reduced from 5 items to 4 (Home, Map, User, Settings) with clean SVG icons. Removed floating `+` button.
- **UserProfile.jsx** — New profile screen with avatar, inline bio/name/avatar editing, CO₂ and XP metric cards, derived achievements list, and a forest impact CTA card.
- **Settings.jsx** — New minimal settings screen with version info and logout.
- **App.jsx** — Added `/app/user` and `/app/settings` routes.
- **user.js (backend)** — `PATCH /api/user/profile` endpoint for updating name, bio, avatarUrl. `GET /api/user/progress` now returns `bio`.
- **schema.prisma** — Added `bio String?` field to `User` model. Run migration:
  ```bash
  cd backend && npx prisma migrate dev --name add_bio_to_user
  ```
- **api.js** — Added `api.updateProfile(data)` method.

---

## Notes

- **Map**: Replace the placeholder in `Mapa.jsx` with Mapbox GL JS or Google Maps.
- **Social OAuth**: Stubs in `/api/auth/social` — wire real Google/Apple tokens.
- **Payments**: Course purchases are tracked DB-side; add Stripe for real payments.
- **NFT / Blockchain**: `txHash` is a stub UUID. Integrate with Polygon/Ethereum provider (e.g. Alchemy + ethers.js) to write actual on-chain transactions.
- **Avatar upload**: Currently accepts a URL string. Add file upload support (e.g. multer + S3/Cloudinary) when ready.
