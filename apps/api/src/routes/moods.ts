import { Router, Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { z } from 'zod';
import crypto from 'node:crypto';
import { PulseDTO } from '../lib/types';

const prisma = new PrismaClient();
const r = Router();

const CreatePulse = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  mood: z.enum(['HAPPY','SAD','STRESSED','CALM','ENERGIZED','TIRED']).or(
    z.enum(['happy','sad','stressed','calm','energized','tired'])
  ),
  energy: z.number().int().min(1).max(5),
  text: z.string().trim().max(150).optional()
});

const toEnum = (s: string): Prisma.Mood => Prisma.Mood[s.toUpperCase() as keyof typeof Prisma.Mood];

r.get('/', async (req: Request, res: Response) => {
  const sinceMinutes = Number(req.query.sinceMinutes ?? 720);
  const since = new Date(Date.now() - sinceMinutes * 60_000);
  const rows = await prisma.pulse.findMany({
    where: { createdAt: { gte: since }, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
    take: 1000
  });
  const data: PulseDTO[] = rows.map(m => ({
    id: m.id, lat: m.lat, lng: m.lng,
    mood: m.mood as any, energy: m.energy, text: m.text ?? null,
    createdAt: m.createdAt.toISOString()
  }));
  res.json({ data });
});

r.post('/', async (req: Request, res: Response) => {
  const parsed = CreatePulse.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { lat, lng, mood, energy, text } = parsed.data;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const deleteToken = crypto.randomBytes(24).toString('hex');

  const created = await prisma.pulse.create({
    data: {
      lat, lng,
      mood: toEnum(mood as string),
      energy,
      text: text ?? null,
      deleteToken,
      expiresAt
    },
    select: { id: true, deleteToken: true, createdAt: true }
  });

  res.status(201).json(created);
});

r.delete('/:id', async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const token = String(req.query.token ?? '');
  if (!token) return res.status(400).json({ error: 'token required' });

  const found = await prisma.pulse.findUnique({ where: { id } });
  if (!found) return res.status(404).json({ error: 'not found' });
  if (found.deleteToken !== token) return res.status(403).json({ error: 'invalid token' });

  await prisma.pulse.delete({ where: { id } });
  res.json({ ok: true });
});

export default r;
