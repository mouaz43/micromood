import express from 'express';
import http from 'http';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });

// ——— Security & basics
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://unpkg.com"],
      "style-src": ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
      "font-src": ["'self'", "https://fonts.gstatic.com"],
      "img-src": ["'self'", "data:", "https://*.tile.openstreetmap.org"],
      "connect-src": ["'self'", "ws:", "wss:"]
    }
  }
}));
app.use(express.json({ limit: '1mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Rate limit posting: max 20 posts/hour per IP
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

// ——— Database
const useSSL = (process.env.DATABASE_SSL === 'true') || process.env.NODE_ENV === 'production';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
});

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS moods (
      id SERIAL PRIMARY KEY,
      lat DOUBLE PRECISION NOT NULL,
      lng DOUBLE PRECISION NOT NULL,
      mood SMALLINT NOT NULL CHECK (mood BETWEEN -2 AND 2),
      text VARCHAR(280),
      connect_consent BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_moods_created_at ON moods(created_at);
  `);
}

// ——— API
app.get('/health', (_req, res) => res.status(200).send('ok'));

app.get('/api/moods', async (req, res) => {
  const sinceHours = Math.min(parseInt(req.query.sinceHours) || 24, 168); // cap at 7 days
  try {
    const { rows } = await pool.query(
      `SELECT id, lat, lng, mood, text, connect_consent, created_at
       FROM moods
       WHERE created_at >= NOW() - ($1::text)::interval
       ORDER BY created_at DESC
       LIMIT 2000`,
      [`${sinceHours} hours`]
    );
    res.json({ ok: true, data: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'DB_ERROR' });
  }
});

app.post('/api/moods', limiter, async (req, res) => {
  try {
    const { lat, lng, mood, text, connectConsent } = req.body || {};

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ ok: false, error: 'BAD_COORDS' });
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ ok: false, error: 'RANGE_COORDS' });
    }
    const allowed = [-2, -1, 0, 1, 2];
    if (!allowed.includes(mood)) {
      return res.status(400).json({ ok: false, error: 'BAD_MOOD' });
    }
    const safeText = (typeof text === 'string' ? text : '').trim().slice(0, 280);
    const consent = !!connectConsent;

    const { rows } = await pool.query(
      `INSERT INTO moods (lat, lng, mood, text, connect_consent)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, lat, lng, mood, text, connect_consent, created_at`,
      [lat, lng, mood, safeText, consent]
    );

    const saved = rows[0];
    io.emit('new_mood', saved);
    res.json({ ok: true, data: saved });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
  }
});

// Clean up DB entries older than 72h (we *show* only last 24h, but keep a bit for safety)
async function pruneOld() {
  try {
    await pool.query(`DELETE FROM moods WHERE created_at < NOW() - INTERVAL '72 hours'`);
  } catch (e) { console.error('pruneOld failed', e); }
}
setInterval(pruneOld, 60 * 60 * 1000); // hourly

// ——— Sockets
io.on('connection', (socket) => {
  socket.on('disconnect', () => {});
});

// ——— Start
const PORT = process.env.PORT || 3000;
ensureTable().then(() => {
  server.listen(PORT, () => {
    console.log(`Micromood listening on :${PORT}`);
  });
});
