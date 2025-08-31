import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { z } from "zod";
import crypto from "node:crypto";

export const router = Router();

/* ------------ Schemas ------------ */
const MoodInput = z.object({
  mood: z.string().min(1).max(40),
  energy: z.number().int().min(1).max(5),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  city: z.string().max(120).optional(),
  country: z.string().max(120).optional(),
  message: z.string().min(1).max(150).optional(),
});

const BBoxQuery = z.string()
  .transform((s) => s.split(",").map(Number))
  .pipe(z.tuple([z.number(), z.number(), z.number(), z.number()]));

function parseBBox(raw: unknown) {
  if (typeof raw !== "string") return null;
  const p = BBoxQuery.safeParse(raw);
  return p.success ? p.data : null;
}
const minutesAgo = (m: number) => new Date(Date.now() - m * 60 * 1000);

/* ------------ Routes ------------ */

// POST /api/moods  -> { id, createdAt, deleteToken }
router.post("/", async (req: Request, res: Response) => {
  try {
    const data = MoodInput.parse(req.body);
    const deleteToken = crypto.randomUUID();
    const saved = await prisma.mood.create({
      data: { ...data, deleteToken },
      select: { id: true, createdAt: true, deleteToken: true },
    });
    return res.status(201).json(saved);
  } catch (err: any) {
    console.error("POST /api/moods failed:", err);
    // Zod validation
    if (err?.issues) return res.status(400).json({ error: "Invalid payload", details: err.issues });
    // Prisma codes surface for easier debugging
    if (err?.code) return res.status(500).json({ error: "PrismaError", code: err.code, meta: err.meta ?? null });
    return res.status(500).json({ error: "Unexpected error", message: String(err?.message ?? err) });
  }
});

// GET /api/moods?bbox=west,south,east,north&sinceMinutes=1440
router.get("/", async (req: Request, res: Response) => {
  try {
    const bbox = parseBBox(req.query.bbox);
    const sinceMinutes = Number(req.query.sinceMinutes ?? "1440");
    const since = minutesAgo(Number.isFinite(sinceMinutes) ? sinceMinutes : 1440);

    const where: any = { createdAt: { gte: since } };
    if (bbox) {
      const [w, s, e, n] = bbox;
      where.AND = [{ lat: { gte: s, lte: n } }, { lng: { gte: w, lte: e } }];
    }

    const moods = await prisma.mood.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 5000,
      select: {
        id: true, createdAt: true, lat: true, lng: true,
        mood: true, energy: true, city: true, country: true, message: true,
      },
    });
    return res.json({ data: moods });
  } catch (err) {
    console.error("GET /api/moods failed:", err);
    return res.status(500).json({ error: "Unexpected error" });
  }
});

// DELETE /api/moods/:id  (header x-delete-token or body.deleteToken)
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const token = (req.headers["x-delete-token"] as string | undefined)
      || (req.body && (req.body as any).deleteToken);
    if (!token) return res.status(400).json({ error: "Missing delete token" });

    const mood = await prisma.mood.findUnique({ where: { id }, select: { deleteToken: true } });
    if (!mood) return res.status(404).json({ error: "Not found" });
    if (mood.deleteToken !== token) return res.status(403).json({ error: "Invalid token" });

    await prisma.mood.delete({ where: { id } });
    return res.json({ ok: true });
  } catch (err: any) {
    console.error("DELETE /api/moods failed:", err);
    if (err?.code) return res.status(500).json({ error: "PrismaError", code: err.code, meta: err.meta ?? null });
    return res.status(500).json({ error: "Unexpected error", message: String(err?.message ?? err) });
  }
});

// (optional) GET /api/moods/aggregate (kept simple)
router.get("/aggregate", async (req: Request, res: Response) => {
  try {
    const bbox = parseBBox(req.query.bbox);
    if (!bbox) return res.status(400).json({ error: "bbox=west,south,east,north is required" });

    const cellSize = Number(req.query.cellSize ?? "0.5");
    const sinceMinutes = Number(req.query.sinceMinutes ?? "1440");
    const [w, s, e, n] = bbox;
    const since = minutesAgo(Number.isFinite(sinceMinutes) ? sinceMinutes : 1440);

    const where: any = { createdAt: { gte: since }, AND: [{ lat: { gte: s, lte: n } }, { lng: { gte: w, lte: e } }] };
    const points = await prisma.mood.findMany({ where, select: { lat: true, lng: true, energy: true } });

    const grid: Record<string, { count: number; energySum: number }> = {};
    for (const p of points) {
      const gx = Math.floor((p.lng - w) / cellSize);
      const gy = Math.floor((p.lat - s) / cellSize);
      const key = `${gx}:${gy}`;
      (grid[key] ??= { count: 0, energySum: 0 });
      grid[key].count++; grid[key].energySum += p.energy;
    }
    const cells = Object.entries(grid).map(([key, v]) => {
      const [gx, gy] = key.split(":").map(Number);
      return { lng: w + gx * cellSize + cellSize / 2, lat: s + gy * cellSize + cellSize / 2, count: v.count, avgEnergy: v.energySum / v.count };
    });

    return res.json({ cellSize, cells });
  } catch (err) {
    console.error("GET /api/moods/aggregate failed:", err);
    return res.status(500).json({ error: "Unexpected error" });
  }
});
