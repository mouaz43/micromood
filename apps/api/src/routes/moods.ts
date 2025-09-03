// apps/api/src/routes/moods.ts
import { Router, type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import crypto from 'node:crypto';

const prisma = new PrismaClient();
const router = Router();

/** Local enum as string-union: works on any Prisma version */
type MoodStr = 'HAPPY' | 'SAD' | 'STRESSED' | 'CALM' | 'ENERGIZED' | 'TIRED';
const ALL_MOODS = ['HAPPY','SAD','STRESSED','CALM','ENERGIZED','TIRED'] as const;

/** API response DTO (kept local so we don't import cross-files) */
type PulseDTO = {
  id: string;
  lat: number;
  lng: number;
  mood: MoodStr;
  energy: number;
  text: string | null;
  createdAt: string;
};

/** Body validation for creating pulses */
const CreatePulse = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  mood: z.enum(['HAPPY','SAD','STRESSED','CALM','ENERGIZED','TIRED'])
        .or(z.enum(['happy','sad','stressed','calm','energized','tired'])),
  energy: z.number().int().min(1).max(5),
  text: z.string().trim().max(150).optional(),
});

/** Normalize and guard mood string */
function toMood(s: string): MoodStr {
  const up = s.toUpperCase() as MoodStr;
  // Type guard: ensure it’s one of our allowed values
  return (ALL_MOODS as readonly string[]).includes(up) ? up : 'CALM';
}

/** Round to ~100m for a little location privacy */
function roundCoord(v: number) {
  return Math.round(v / 0.001) * 0.001;
}

/** GET /moods?sinceMinutes=720 — list recent, non-expired pulses */
router.get('/', async (req: Request, res: Response) => {
  const sinceMinutesRaw = Number(req.query.sinceMinutes ?? 720);
  const sinceMinutes = Number.isFinite(sinceMinutesRaw) ? Math.max(5, Math.min(60*24*7, sinceMinutesRaw)) : 720;
  const since = new Date(Date.now() - sinceMinutes * 60_000);

  const rows = await prisma.pulse.findMany({
    where: { createdAt: { gte: since }, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
    take: 1000,
  });

  const data: PulseDTO[] = rows.map((m) => ({
    id: m.id,
    lat: m.lat,
    lng: m.lng,
    mood: (m.mood as unknown as MoodStr), // map DB enum to our union
    energy: m.energy,
    text: m.text ?? null,
    createdAt: m.createdAt.toISOString(),
  }));

  res.json({ data });
});

/** POST /moods — create a pulse and return id + deleteToken */
router.post('/', async (req: Request, res: Response) => {
  const parsed = CreatePulse.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { lat, lng, mood, energy, text } = parsed.data;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const deleteToken = crypto.randomBytes(24).toString('hex');

  const created = await prisma.pulse.create({
    data: {
      lat: roundCoord(lat),
      lng: roundCoord(lng),
      // Pass the normalized string; TS cast avoids depending on Prisma enum types
      mood: toMood(mood as string) as any,
      energy,
      text: text ?? null,
      deleteToken,
      expiresAt,
    },
    select: { id: true, deleteToken: true, createdAt: true },
  });

  res.status(201).json(created);
});

/** DELETE /moods/:id?token=... — delete by token */
router.delete('/:id', async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const token = String(req.query.token ?? '');
  if (!token) return res.status(400).json({ error: 'token required' });

  const found = await prisma.pulse.findUnique({ where: { id } });
  if (!found) return res.status(404).json({ error: 'not found' });
  if (found.deleteToken !== token) return res.status(403).json({ error: 'invalid token' });

  await prisma.pulse.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
