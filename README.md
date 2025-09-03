# Micromood — under the same sky

Anonymous mood pulses on a live world map. No login. Optional “connect the dots”.
Dots auto-expire after 24h. Starry-sky background. Built for Render.

## Local Dev
1. `cp .env.example .env` and set `DATABASE_URL`
2. `npm i`
3. `npm run dev`
4. Open http://localhost:3000

## Deploy (Render)
- Provision a PostgreSQL instance and copy `DATABASE_URL`
- Create Web Service from this repo, Node 18+, start: `node server.js`
- Set env `DATABASE_URL`, `DATABASE_SSL=true`
