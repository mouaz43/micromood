import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import type { MoodName, NewPulseInput, PulseDTO } from '../lib/types.js';

const MOODS: readonly MoodName[] = ['happy','sad','stressed','calm','energized','tired'] as const;

const newPulseSchema = z.object({
  mood: z.enum(MOODS as [MoodName, ...MoodName[]]),
  energy: z.number().int().min(1).max(5),
  text: z.string().max(150).optional(),
  lat: z.number().finite(),
  lng: z.number().finite()
});

const router = Router();

// GET /moods?sinceMinutes=720  (default 720 => 12h)
router.get('/', async (req, res, next) => {
  try {
    const sinceMinutes = Math.max(0, Number(req.query.sinceMinutes ?? 720));
    const since = new Date(Date.now() - sinceMinutes * 60_000);

    const rows = await prisma.moodPulse.findMany({
      where: {
        createdAt: { gte: since }
      },
      orderBy: { createdAt: 'desc' },
      take: 1000
    });

    const out: PulseDTO[] = rows.map(r => ({
      id: r.id,
      mood: r.mood as MoodName,
      energy: r.energy,
      text: r.text ?? undefined,
      lat: r.lat,
      lng: r.lng,
      createdAt: r.createdAt.toISOString()
    }));

    res.json(out);
  } catch (err) {
    next(err);
  }
});

// POST /moods
router.post('/', async (req, res, next) => {
  try {
    const parsed = newPulseSchema.parse(req.body) as NewPulseInput;

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const created = await prisma.moodPulse.create({
      data: {
        mood: parsed.mood,
        energy: parsed.energy,
        text: parsed.text?.trim() || null,
        lat: parsed.lat,
        lng: parsed.lng,
        expiresAt
      }
    });

    res.status(201).json({ id: created.id });
  } catch (err) {
    next(err);
  }
});

// DELETE /moods/:id  (requires ADMIN_SECRET in header x-admin-secret)
router.delete('/:id', async (req, res, next) => {
  try {
    const admin = req.header('x-admin-secret');
    if (!admin || admin !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ error: 'forbidden' });
    }
    const id = String(req.params.id);
    await prisma.moodPulse.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
