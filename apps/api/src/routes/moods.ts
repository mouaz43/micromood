import { Router, type Request, type Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';
import crypto from 'node:crypto';
import type { PulseDTO } from '../lib/types';

const prisma = new PrismaClient();
const router = Router();

const CreatePulse = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  mood: z.enum(['HAPPY','SAD','STRESSED','CALM','ENERGIZED','TIRED']).or(
    z.enum(['happy','sad','stressed','calm','energized','tired'])
  ),
  energy: z.number().int().min(1).max(5),
  text: z.string().trim().max(150).optional()
});

// In Prisma v5, the enum type is under $Enums
type MoodEnum = Prisma.$Enums.Mood;

router.get('/', async (req: Request, res: Response) => {
  const sinceMinutes = Number(req.query.sinceMinutes ?? 720);
  const since = new Date(Date.now() - sinceMinutes * 60_000);

  const rows = await prisma.pulse.findMany({
    where: { createdAt: { gte: since }, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
    take: 1000
  });

  const data: PulseDTO[] = rows.map((m): PulseDTO => ({
    id: m.id,
    lat: m.lat,
    lng: m.lng,
    mood: m.mood as MoodEnum,
    energy: m.energy,
    text: m.text ?? null,
    createdAt: m.createdAt.toISOString()
  }));

  res.json({ data });
});

router.post('/', async (req: Request, res: Response) => {
  const parsed = CreatePulse.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { lat, lng, mood, energy, text } = parsed.data;
  const normalized = (mood as string).toUpperCase() as MoodEnum;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const deleteToken = crypto.randomBytes(24).toString('hex');

  const created = await prisma.pulse.create({
    data: { lat, lng, mood: normalized, energy, text: text ?? null, deleteToken, expiresAt },
    select: { id: true, deleteToken: true, createdAt: true }
  });

  res.status(201).json(created);
});

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
