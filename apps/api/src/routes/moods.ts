import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();
const router = Router();

// Helper: minutes to ISO cutoff (default 1440 = 24h)
const cutOff = (sinceMinutes?: number) => {
  const mins = Number.isFinite(sinceMinutes) && sinceMinutes! > 0 ? sinceMinutes! : 1440;
  const d = new Date(Date.now() - mins * 60_000);
  return d;
};

// GET /moods?sinceMinutes=1440
router.get("/", async (req, res) => {
  try {
    const since = cutOff(Number(req.query.sinceMinutes));
    const data = await prisma.mood.findMany({
      where: { createdAt: { gte: since } },
      select: {
        id: true,
        mood: true,
        energy: true,
        text: true,
        lat: true,
        lng: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 2000,
    });
    res.json({ data });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch moods" });
  }
});

// POST /moods
// { mood:string, energy:number, text?:string, lat:number, lng:number }
router.post("/", async (req, res) => {
  try {
    const { mood, energy, text, lat, lng } = req.body ?? {};
    if (!mood || typeof energy !== "number" || typeof lat !== "number" || typeof lng !== "number") {
      return res.status(400).json({ error: "Invalid payload" });
    }
    const deleteToken = crypto.randomBytes(24).toString("hex"); // store client-side
    const created = await prisma.mood.create({
      data: { mood, energy, text: text?.slice(0, 150) ?? null, lat, lng, deleteToken },
      select: { id: true, deleteToken: true },
    });
    res.status(201).json(created);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: "Failed to create mood" });
  }
});

// DELETE /moods/:id?token=xxx
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const token = String(req.query.token || "");
    if (!id || !token) return res.status(400).json({ error: "Missing id or token" });

    const found = await prisma.mood.findUnique({ where: { id } });
    if (!found) return res.status(404).json({ error: "Not found" });
    if (found.deleteToken !== token) return res.status(403).json({ error: "Forbidden" });

    await prisma.mood.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete mood" });
  }
});

export default router;
