import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { z } from "zod";

export const router = Router();

const MoodInput = z.object({
  mood: z.string().min(1).max(40),
  energy: z.number().int().min(1).max(5),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  city: z.string().max(120).optional(),
  country: z.string().max(120).optional(),
});

router.post("/", async (req, res) => {
  try {
    const parsed = MoodInput.parse(req.body);
    const saved = await prisma.mood.create({ data: parsed });
    res.status(201).json({ id: saved.id, createdAt: saved.createdAt });
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ error: "Invalid payload", details: err.issues });
    }
    console.error(err);
    res.status(500).json({ error: "Unexpected error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const bbox = (req.query.bbox as string | undefined)?.split(",").map(Number);
    const sinceMinutes = Number(req.query.sinceMinutes ?? "1440");
    const sinceDate = new Date(Date.now() - sinceMinutes * 60 * 1000);

    const where: any = { createdAt: { gte: sinceDate } };
    if (bbox && bbox.length === 4 && bbox.every(Number.isFinite)) {
      const [west, south, east, north] = bbox;
      where.AND = [{ lat: { gte: south, lte: north } }, { lng: { gte: west, lte: east } }];
    }

    const moods = await prisma.mood.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 5000,
    });

    res.json({ data: moods });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unexpected error" });
  }
});

router.get("/aggregate", async (req, res) => {
  try {
    const bbox = (req.query.bbox as string | undefined)?.split(",").map(Number);
    const cellSize = Number(req.query.cellSize ?? "0.5");
    const sinceMinutes = Number(req.query.sinceMinutes ?? "1440");
    if (!bbox || bbox.length !== 4) return res.status(400).json({ error: "bbox=west,south,east,north is required" });

    const [west, south, east, north] = bbox;
    const sinceDate = new Date(Date.now() - sinceMinutes * 60 * 1000);

    const where: any = {
      createdAt: { gte: sinceDate },
      AND: [{ lat: { gte: south, lte: north } }, { lng: { gte: west, lte: east } }],
    };

    const points = await prisma.mood.findMany({ where, select: { lat: true, lng: true, energy: true } });

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
      const [gx, gy] = key.split(":").map(Number);
      return {
        lng: west + gx * cellSize + cellSize / 2,
        lat: south + gy * cellSize + cellSize / 2,
        count: v.count,
        avgEnergy: v.energySum / v.count,
      };
    });

    res.json({ cellSize, cells });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unexpected error" });
  }
});
