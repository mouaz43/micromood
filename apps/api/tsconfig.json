import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { z } from "zod";

export const router = Router();

/** ---------- Schemas ---------- **/
const MoodInput = z.object({
  mood: z.string().min(1).max(40),
  energy: z.number().int().min(1).max(5),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  city: z.string().max(120).optional(),
  country: z.string().max(120).optional(),
});

const BBoxQuery = z
  .string()
  .transform((s) => s.split(",").map((n) => Number(n)))
  .pipe(z.tuple([z.number(), z.number(), z.number(), z.number()]));

/** ---------- Helpers ---------- **/
function parseBBox(bboxRaw: unknown): [number, number, number, number] | null {
  if (typeof bboxRaw !== "string") return null;
  const parsed = BBoxQuery.safeParse(bboxRaw);
  return parsed.success ? parsed.data : null;
}

function minutesAgo(minutes: number): Date {
  return new Date(Date.now() - minutes * 60 * 1000);
}

/** ---------- Routes ---------- **/

// POST /api/moods
router.post("/", async (req: Request, res: Response) => {
  try {
    const parsed = MoodInput.parse(req.body);
    const saved = await prisma.mood.create({ data: parsed });
    return res.status(201).json({ id: saved.id, createdAt: saved.createdAt });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "issues" in (err as any)) {
      return res.status(400).json({ error: "Invalid payload", details: (err as any).issues });
    }
    console.error(err);
    return res.status(500).json({ error: "Unexpected error" });
  }
});

// GET /api/moods?bbox=west,south,east,north&sinceMinutes=1440
router.get("/", async (req: Request, res: Response) => {
  try {
    const bbox = parseBBox(req.query.bbox);
    const sinceMinutes = Number(req.query.sinceMinutes ?? "1440");
    const sinceDate = minutesAgo(Number.isFinite(sinceMinutes) ? sinceMinutes : 1440);

    const where: Record<string, unknown> = { createdAt: { gte: sinceDate } };

    if (bbox) {
      const [west, south, east, north] = bbox;
      (where as any).AND = [
        { lat: { gte: south, lte: north } },
        { lng: { gte: west, lte: east } },
      ];
    }

    const moods = await prisma.mood.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 5000,
    });

    return res.json({ data: moods });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unexpected error" });
  }
});

// GET /api/moods/aggregate?bbox=west,south,east,north&cellSize=0.5&sinceMinutes=1440
router.get("/aggregate", async (req: Request, res: Response) => {
  try {
    const bbox = parseBBox(req.query.bbox);
    if (!bbox) {
      return res.status(400).json({ error: "bbox=west,south,east,north is required" });
    }

    const cellSize = Number(req.query.cellSize ?? "0.5");
    const sinceMinutes = Number(req.query.sinceMinutes ?? "1440");

    const [west, south, east, north] = bbox;
    const sinceDate = minutesAgo(Number.isFinite(sinceMinutes) ? sinceMinutes : 1440);

    const where: Record<string, unknown> = {
      createdAt: { gte: sinceDate },
      AND: [
        { lat: { gte: south, lte: north } },
        { lng: { gte: west, lte: east } },
      ],
    };

    const points = await prisma.mood.findMany({
      where,
      select: { lat: true, lng: true, energy: true },
    });

    // Build a simple grid aggregate
    const grid: Record<string, { count: number; energySum: number }> = {};
    for (const p of points) {
      const gx = Math.floor((p.lng - west) / cellSize);
      const gy = Math.floor((p.lat - south) / cellSize);
      const key = `${gx}:${gy}`;
      if (!grid[key]) grid[key] = { count: 0, energySum: 0 };
      grid[key].count += 1;
      grid[key].energySum += p.energy;
    }

    const cells = Object.entries(grid).map(([key, v]) => {
      const [gx, gy] = key.split(":").map((n) => Number(n));
      return {
        lng: west + gx * cellSize + cellSize / 2,
        lat: south + gy * cellSize + cellSize / 2,
        count: v.count,
        avgEnergy: v.energySum / v.count,
      };
    });

    return res.json({ cellSize, cells });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unexpected error" });
  }
});
