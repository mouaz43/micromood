import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();
const router = Router();

const OWNER_CODE = process.env.OWNER_CODE || "";

// helpers
const sinceDate = (mins = 1440) => new Date(Date.now() - mins * 60_000);
const cleanup = async () => {
  const cut = sinceDate(1440);
  await prisma.mood.deleteMany({ where: { createdAt: { lt: cut } } });
};

// GET /moods?sinceMinutes=1440
router.get("/", async (req, res) => {
  try {
    await cleanup();
    const since = Number(req.query.sinceMinutes ?? 1440);
    const data = await prisma.mood.findMany({
      where: { createdAt: { gte: sinceDate(since) } },
      orderBy: { createdAt: "desc" },
      take: 2000,
      select: { id:true, mood:true, energy:true, text:true, lat:true, lng:true, createdAt:true }
    });
    res.json({ data });
  } catch (e:any) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch moods" });
  }
});

// POST /moods
router.post("/", async (req, res) => {
  try {
    await cleanup();
    const { mood, energy, text, lat, lng } = req.body ?? {};
    if (!mood || typeof energy !== "number" || typeof lat !== "number" || typeof lng !== "number") {
      return res.status(400).json({ error: "Invalid payload" });
    }
    const deleteToken = crypto.randomBytes(24).toString("hex");
    const created = await prisma.mood.create({
      data: { mood, energy, text: text?.slice(0,150) ?? null, lat, lng, deleteToken },
      select: { id:true, deleteToken:true }
    });
    res.status(201).json(created);
  } catch (e:any) {
    console.error(e);
    res.status(500).json({ error: "Failed to create mood" });
  }
});

// DELETE /moods/:id  (supports token OR owner header)
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Missing id" });

    const owner = String(req.header("x-owner-code") || "");
    if (owner && OWNER_CODE && owner === OWNER_CODE) {
      await prisma.mood.delete({ where: { id } });
      return res.json({ ok: true, owner: true });
    }

    const token = String(req.query.token || "");
    const found = await prisma.mood.findUnique({ where: { id } });
    if (!found) return res.status(404).json({ error: "Not found" });
    if (!token || found.deleteToken !== token) return res.status(403).json({ error: "Forbidden" });

    await prisma.mood.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e:any) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete mood" });
  }
});

export default router;
