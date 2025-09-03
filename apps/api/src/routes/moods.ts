// apps/api/src/routes/moods.ts
import { Router, type Request, type Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';
import crypto from 'node:crypto';

const prisma = new PrismaClient();
const router = Router();

/** Response DTO kept local to avoid cross-file import issues */
type PulseDTO = {
  id: string;
  lat: number;
  lng: number;
  mood: Prisma.$Enums.Mood;
  energy: number;
  text: string | null;
  createdAt: string;
};

/** Body validation for creating pulses */
const CreatePulse = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  mood: z.enum(['HAPPY', 'SAD', 'STRESSED', 'CALM', 'ENERGIZED', 'TIRED'])
        .or(z.enum(['happy', 'sad', 'stressed', 'calm', 'energized', 'tired'])),
  energy: z.number().int().min(1).max(5),
  text: z.string().trim().max(150).optional(),
});

/** Normalize a string mood into the Prisma enum (uppercase) */
function toMoodEnum(m: string): Prisma.$Enums.Mood {
  const up = m.toUpperCase();
  // Type guard against bad strings
  const all = ['HAPPY','SAD','STRESSED','CALM','ENERGIZED','TIRED'] as const;
  if ((all as readonly string[]).includes(up)) return up as Prisma.$Enums.Mood;
  // fallback (should never happen due to zod)
  return 'CALM';
}

/** GET /moods?sinceMinutes=720 — list recent, non-expired pulses */
router.get('/', async (req: Request, res: Response) => {
  const sinceMinutes = Number(req.query.sinceMinutes ?? 720);
  const since = new Date(Date.now() - Math.max(5, sinceMinutes) * 60_000);

  const rows = await prisma.pulse.findMany({
    where: { createdAt: { gte: since }, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
    take: 1000,
  });

  const data: PulseDTO[] = rows.map((m) => ({
    id: m.id,
    lat: m.lat,
    lng: m.lng,
    mood: m.mood as Prisma.$Enums.Mood,
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

  // 24h expiry + secure delete token
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const deleteToken = crypto.randomBytes(24).toString('hex');

  // small privacy: round coords to ~100m
  const round = (v: number) => Math.round(v / 0.001) * 0.001;

  const created = await prisma.pulse.create({
    data: {
      lat: round(lat),
      lng: round(lng),
      mood: toMoodEnum(mood as string),
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
