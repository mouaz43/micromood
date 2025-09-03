import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import type { NewPulse, PulseDTO } from './types.js';

const app = express();
const prisma = new PrismaClient();

const WEB_ORIGIN = process.env.WEB_ORIGIN ?? '*';
const OWNER_PASS = process.env.OWNER_PASS ?? '';

app.use(express.json({ limit: '256kb' }));
app.use(
  cors({
    origin: (origin, cb) => cb(null, true), // Render sits behind proxies; we’ll trust and validate in code when needed.
    credentials: false
  })
);

// tiny logger
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/healthz', (_req, res) => res.json({ ok: true }));

app.get('/moods', async (req, res) => {
  const sinceMinutes = Math.max(5, Math.min(60 * 24 * 7, Number(req.query.sinceMinutes ?? 720)));
  const since = new Date(Date.now() - sinceMinutes * 60_000);

  const rows = await prisma.moodEntry.findMany({
    where: { createdAt: { gt: since } },
    orderBy: { createdAt: 'desc' },
    take: 1000
  });

  const dto: PulseDTO[] = rows.map(r => ({
    id: r.id as any,
    lat: r.lat,
    lng: r.lng,
    mood: r.mood as any,
    energy: r.energy,
    text: r.text,
    createdAt: r.createdAt.toISOString()
  }));

  res.json({ data: dto });
});

app.post('/moods', async (req, res) => {
  try {
    const b: NewPulse = req.body;
    // basic validation
    if (!b || typeof b.lat !== 'number' || typeof b.lng !== 'number') {
      return res.status(400).json({ error: 'Invalid lat/lng' });
    }
    if (!['HAPPY','SAD','STRESSED','CALM','ENERGIZED','TIRED'].includes(b.mood)) {
      return res.status(400).json({ error: 'Invalid mood' });
    }
    if (typeof b.energy !== 'number' || b.energy < 1 || b.energy > 5) {
      return res.status(400).json({ error: 'Invalid energy (1-5)' });
    }
    const text = (b.text ?? '').trim().slice(0, 150);

    const deleteToken = cryptoRandom();
    const row = await prisma.moodEntry.create({
      data: {
        lat: b.lat,
        lng: b.lng,
        mood: b.mood as any,
        energy: b.energy,
        text,
        deleteToken
      }
    });

    res.json({ ok: true, id: row.id, deleteToken });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'Unexpected error' });
  }
});

// delete by token or owner
app.delete('/moods/:id', async (req, res) => {
  const id = req.params.id;
  const token = (req.query.token as string) || (req.body?.token as string) || '';
  const ownerPass = req.header('x-owner-pass') ?? '';

  try {
    let row = await prisma.moodEntry.findUnique({ where: { id: castId(id) } as any });

    if (!row) return res.status(404).json({ error: 'Not found' });

    const canDelete = (token && row.deleteToken === token) || (OWNER_PASS && ownerPass === OWNER_PASS);
    if (!canDelete) return res.status(403).json({ error: 'Forbidden' });

    await prisma.moodEntry.delete({ where: { id: row.id } });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Unexpected error' });
  }
});

// owner list or cleanup (optional)
app.get('/owner/moods', async (req, res) => {
  const pass = req.header('x-owner-pass') ?? '';
  if (!OWNER_PASS || pass !== OWNER_PASS) return res.status(403).json({ error: 'Forbidden' });

  const rows = await prisma.moodEntry.findMany({ orderBy: { createdAt: 'desc' }, take: 2000 });
  res.json(rows);
});

app.post('/owner/cleanup', async (req, res) => {
  const pass = req.header('x-owner-pass') ?? '';
  if (!OWNER_PASS || pass !== OWNER_PASS) return res.status(403).json({ error: 'Forbidden' });

  const cutoff = new Date(Date.now() - 24 * 60 * 60_000);
  const r = await prisma.moodEntry.deleteMany({ where: { createdAt: { lt: cutoff } } });
  res.json({ ok: true, deleted: r.count });
});

const port = process.env.PORT ?? 10000;
app.listen(port, () => console.log(`API listening on :${port}`));

// helpers
function cryptoRandom() {
  return [...crypto.getRandomValues(new Uint8Array(16))]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
function castId(id: string) {
  // if your DB uses Int IDs:
  const n = Number(id);
  return Number.isFinite(n) ? n : -1;
}
