import { Router, type Request, type Response } from 'express';
import { PrismaClient, Mood as MoodEnum } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
export const router = Router();

// Validation
const MoodCreate = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  mood: z.enum(['HAPPY', 'SAD', 'STRESSED', 'CALM', 'ENERGIZED', 'TIRED']),
  energy: z.number().int().min(1).max(5),
  text: z.string().trim().max(150).optional(),
  city: z.string().trim().max(80).optional()
});

router.get('/', async (req: Request, res: Response) => {
  const sinceMinutes = Number(req.query.sinceMinutes ?? 720); // last 12h
  const since = new Date(Date.now() - sinceMinutes * 60_000);

  const rows = await prisma.mood.findMany({
    where: {
      createdAt: { gt: since },
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: 'desc' },
    take: 500
  });

  res.json(rows);
});

router.post('/', async (req: Request, res: Response) => {
  const parsed = MoodCreate.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }

  const { lat, lng, mood, energy, text, city } = parsed.data;
  const deleteToken = cryptoRandom(32);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h self-delete

  const created = await prisma.mood.create({
    data: {
      lat, lng,
      mood: mood as MoodEnum,
      energy,
      text: text ?? null,
      city: city ?? null,
      deleteToken,
      expiresAt
    },
    select: { id: true, deleteToken: true, createdAt: true }
  });

  res.status(201).json(created);
});

router.delete('/:id', async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const token = String(req.query.token ?? '');

  if (!token) return res.status(400).json({ error: 'Missing token' });

  const found = await prisma.mood.findUnique({ where: { id } });
  if (!found) return res.status(404).json({ error: 'Not found' });
  if (found.deleteToken !== token) return res.status(401).json({ error: 'Invalid token' });

  await prisma.mood.delete({ where: { id } });
  res.json({ ok: true });
});

function cryptoRandom(bytes = 32) {
  return [...crypto.getRandomValues(new Uint8Array(bytes))]
    .map(b => b.toString(16).padStart(2, '0')).join('');
}
