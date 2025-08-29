# MicroMood — Global Mood Map (Monorepo)

A modern, open-source web app that turns anonymous mood pulses into a real-time, filterable map.

This repo contains:
- `apps/web` — React + Vite + Tailwind + Motion, a futuristic UI
- `apps/api` — Node/Express + Prisma + PostgreSQL (Render-ready)

## Quick Start (Local)

### Prereqs
- Node 18+
- PNPM or NPM
- PostgreSQL (local or Render Managed Postgres)

### 1) Install deps
```bash
# from root
npm install
cd apps/api && npm install
cd ../web && npm install
```

### 2) Database
Create a Postgres DB and set `DATABASE_URL` in `apps/api/.env` (see `.env.example` in repo root).

Run migrations:
```bash
cd apps/api
npx prisma migrate dev --name init
```

### 3) Run API
```bash
cd apps/api
npm run dev
# API on http://localhost:4000
```

### 4) Run Web
```bash
cd apps/web
# set VITE_API_URL in apps/web/.env (defaults to http://localhost:4000)
npm run dev
# Web on http://localhost:5173
```

## Deploy on Render

### Services
You'll create **two services** from the same GitHub repo:

1. **API (Web Service)**
   - Root: `apps/api`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `node dist/index.js`
   - Environment: add `DATABASE_URL` (from a Render Managed Postgres)
   - Optional Post-Deploy: `npx prisma migrate deploy`

2. **Web (Static Site)**
   - Root: `apps/web`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Environment: add `VITE_API_URL=https://<your-api-on-render>.onrender.com`

### Managed PostgreSQL
- In Render, create a **PostgreSQL** instance and copy its **Internal Connection String**.
- Set `DATABASE_URL` on the API service.

## Environment Variables

Create a `.env` file in repo root (not committed) as a guide:

```
# apps/api
DATABASE_URL=postgresql://user:pass@host:5432/db

# apps/web
VITE_API_URL=http://localhost:4000
```

## API Surface

- `POST /api/moods` — submit a mood pulse
- `GET /api/moods?bbox=west,south,east,north&sinceMinutes=60` — fetch recent moods
- `GET /api/moods/aggregate?bbox=...&cellSize=0.25` — grid aggregate for heatmap

## License
MIT