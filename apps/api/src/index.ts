import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();
const app = express();
const PORT = Number(process.env.PORT || 10000);
const ADMIN_SECRET = process.env.ADMIN_SECRET || ""; // set on Render

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-delete-token", "x-admin-secret"],
  })
);
app.use(bodyParser.json());

// create mood -> returns deleteToken
app.post("/api/moods", async (req, res) => {
  try {
    const { lat, lng, mood, energy, city, country, message } = req.body || {};
    if (
      typeof lat !== "number" || typeof lng !== "number" ||
      typeof energy !== "number" || typeof mood !== "string"
    ) return res.status(400).json({ error: "Invalid payload" });

    const deleteToken = crypto.randomUUID();
    const created = await prisma.mood.create({
      data: { lat, lng, mood, energy, city, country, message, deleteToken },
    });
    res.json({ id: created.id, createdAt: created.createdAt, deleteToken });
  } catch (e) {
    console.error("POST /api/moods", e);
    res.status(500).json({ error: "Failed to save mood" });
  }
});

// list moods (last 12h by default)
app.get("/api/moods", async (req, res) => {
  try {
    const sinceMinutes = parseInt(String(req.query.sinceMinutes ?? "720"), 10);
    const since = new Date(Date.now() - sinceMinutes * 60 * 1000);
    const data = await prisma.mood.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ data });
  } catch (e) {
    console.error("GET /api/moods", e);
    res.status(500).json({ error: "Failed to fetch moods" });
  }
});

// delete mood -> with user's token OR owner secret
app.delete("/api/moods/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const token = (req.headers["x-delete-token"] as string) || "";
    const admin = (req.headers["x-admin-secret"] as string) || "";

    const row = await prisma.mood.findUnique({ where: { id } });
    if (!row) return res.status(404).json({ error: "Not found" });

    const owner = ADMIN_SECRET && admin === ADMIN_SECRET;
    const byToken = token && token === row.deleteToken;
    if (!owner && !byToken) return res.status(403).json({ error: "Invalid delete credentials" });

    await prisma.mood.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/moods/:id", e);
    res.status(500).json({ error: "Failed to delete mood" });
  }
});

app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
