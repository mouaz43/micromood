import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { cleanExpired } from '../lib/cleanup.js';

const router = Router();

const createSchema = z.object({
  mood: z.enum(['HAPPY','SAD','STRESSED','CALM','ENERGIZED','TIRED']),
  energy: z.number().int().min(1).max(5),
  text: z.string().trim().max(150).optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  city: z.string().max(120).optional(),
});

const listSchema = z.object({
  sinceMinutes: z.coerce.number().int().min(5).max(60*24).default(60*12),
  mood: z.enum(['HAPPY','SAD','STRESSED','CALM','ENERGIZED','TIRED']).optional(),
  bbox: z.string().optional(), // "west,south,east,north"
});

router.get('/', async (req, res) => {
  const q = listSchema.safeParse(req.query);
  if (!q.success) return res.status(400).json({ error: q.error.flatten() });

  const { sinceMinutes, mood, bbox } = q.data;
  const since = new Date(Date.now() - sinceMinutes * 60_000);

  const bboxFilter = (() => {
    if (!bbox) return undefined;
    const [w, s, e, n] = bbox.split(',').map(Number);
    if ([w, s, e, n].some((v) => Number.isNaN(v))) return undefined;
    return { AND: [{ lng: { gte: w } }, { lng: { lte: e } }, { lat: { gte: s } }, { lat: { lte: n } }] };
  })();

  await cleanExpired(); // opportunistic cleanup

  const pulses = await prisma.moodPulse.findMany({
    where: {
      createdAt: { gte: since },
      ...(mood ? { mood } : {}),
      ...(bboxFilter ?? {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 1000,
  });

  res.json(pulses);
});

router.post('/', async (req, res) => {
  const body = createSchema.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: body.error.flatten() });

  const { mood, energy, text, lat, lng, city } = body.data;
  const round = (v: number, step = 0.001) => Math.round(v / step) * step;

  const pulse = await prisma.moodPulse.create({
    data: {
      mood,
      energy,
      text: text?.trim() || null,
      lat: round(lat),
      lng: round(lng),
      city: city ?? null,
      deleteToken: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  res.status(201).json({ id: pulse.id, deleteToken: pulse.deleteToken });
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  const token = (req.query.token as string) ?? '';
  if (!id || !token) return res.status(400).json({ error: 'id and token required' });

  const found = await prisma.moodPulse.findUnique({ where: { id } });
  if (!found) return res.status(404).json({ error: 'Not found' });
  if (found.deleteToken !== token) return res.status(401).json({ error: 'Invalid token' });

  await prisma.moodPulse.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
