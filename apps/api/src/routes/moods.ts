import { Router } from "express";
import type { PrismaClient } from "@prisma/client";
import crypto from "node:crypto";

export function buildMoodsRouter(prisma: PrismaClient) {
  const r = Router();

  // GET /moods?sinceMinutes=720 (max 24h)
  r.get("/", async (req, res) => {
    try {
      const sinceMinutes = Math.min(
        24 * 60,
        Math.max(5, Number(req.query.sinceMinutes) || 720)
      );
      const since = new Date(Date.now() - sinceMinutes * 60_000);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const items = await prisma.mood.findMany({
        where: {
          createdAt: { gte: since, gt: dayAgo }
        },
        orderBy: { createdAt: "desc" },
        take: 1500,
        // NOTE: do NOT select non-existent fields like "city"
        select: {
          id: true,
          mood: true,
          energy: true,
          text: true,
          lat: true,
          lng: true,
          createdAt: true
        }
      });

      res.json({ data: items });
    } catch {
      res.status(500).json({ error: "Unexpected error" });
    }
  });

  // POST /moods
  r.post("/", async (req, res) => {
    try {
      const { mood, energy, text, lat, lng, unlockAt } = req.body || {};
      if (
        !mood ||
        typeof mood !== "string" ||
        !Number.isInteger(energy) ||
        energy < 1 ||
        energy > 5 ||
        typeof lat !== "number" ||
        typeof lng !== "number"
      ) {
        return res.status(400).json({ error: "Invalid payload" });
      }

      const deleteToken = crypto.randomBytes(24).toString("base64url");

      const created = await prisma.mood.create({
        data: {
          mood,
          energy,
          text: typeof text === "string" ? text.slice(0, 160) : null,
          lat,
          lng,
          deleteToken,
          unlockAt: unlockAt ? new Date(unlockAt) : null
        },
        select: { id: true, deleteToken: true }
      });

      res.status(201).json({ data: created });
    } catch (e: any) {
      res.status(500).json({ error: "Unexpected error" });
    }
  });

  // DELETE /moods/:id   (header: x-delete-token)
  r.delete("/:id", async (req, res) => {
    try {
      const id = String(req.params.id);
      const token = String(req.header("x-delete-token") || "");
      if (!token) return res.status(401).json({ error: "Missing token" });

      const found = await prisma.mood.findUnique({
        where: { id },
        select: { id: true, deleteToken: true }
      });

      if (!found || found.deleteToken !== token)
        return res.status(403).json({ error: "Forbidden" });

      await prisma.mood.delete({ where: { id } });
      res.json({ ok: true });
    } catch {
      res.status(500).json({ error: "Unexpected error" });
    }
  });

  return r;
}
