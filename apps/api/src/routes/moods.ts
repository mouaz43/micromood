import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { z } from 'zod';

const prisma = new PrismaClient();
export const moodsRouter = Router();

// Shared schemas
const MoodEnum = z.enum(['happy', 'sad', 'stressed', 'calm', 'energized', 'tired']);

const postSchema = z.object({
  mood: MoodEnum,
  energy: z.number().int().min(1).max(5),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  text: z.string().trim().max(150).optional()
});

const getSchema = z.object({
  sinceMinutes: z.coerce.number().int().min(1).max(60 * 24).default(720)
});

// ---- POST /moods  ------------------------------------------------
// Returns { id, deleteToken } so the client can delete later
moodsRouter.post('/', async (req, res, next) => {
  try {
    const body = postSchema.parse(req.body);
    const deleteToken = crypto.randomBytes(24).toString('hex');

    const created = await prisma.mood.create({
      data: {
        mood: body.mood,
        energy: body.energy,
        lat: body.lat,
        lng: body.lng,
        text: body.text ?? null,
        deleteToken
      },
      select: { id: true, deleteToken: true, createdAt: true }
    });

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// ---- GET /moods  -------------------------------------------------
// Public list; does NOT return deleteToken
moodsRouter.get('/', async (req, res, next) => {
  try {
    const { sinceMinutes } = getSchema.parse(req.query);
    const since = new Date(Date.now() - sinceMinutes * 60 * 1000);

    const rows = await prisma.mood.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        mood: true,
        energy: true,
        lat: true,
        lng: true,
        text: true,
        createdAt: true
      },
      take: 1000
    });

    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

// ---- DELETE /moods/:id  -----------------------------------------
// Client must pass ?token=... that matches deleteToken saved at creation
moodsRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);
    const token = z.string().min(10).parse(req.query.token);

    const row = await prisma.mood.findUnique({ where: { id } });
    if (!row) return res.status(404).json({ error: 'Not found' });

    if (row.deleteToken !== token) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    await prisma.mood.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
