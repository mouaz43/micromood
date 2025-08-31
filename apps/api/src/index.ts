import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import bodyParser from "body-parser";
import crypto from "crypto";

const prisma = new PrismaClient();
const app = express();
const PORT = Number(process.env.PORT || 10000);
const ADMIN_SECRET = process.env.ADMIN_SECRET || ""; // optional

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-delete-token", "x-admin-secret"],
  })
);

app.use(bodyParser.json());

// POST /api/moods  -> returns { id, createdAt, deleteToken }
app.post("/api/moods", async (req, res) => {
  try {
    const { lat, lng, mood, energy, city, country, message } = req.body as {
      lat: number; lng: number; mood: string; energy: number;
      city?: string; country?: string; message?: string;
    };

    if (
      typeof lat !== "number" || typeof lng !== "number" ||
      typeof energy !== "number" || typeof mood !== "string"
    ) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const deleteToken = crypto.randomUUID();

    const created = await prisma.mood.create({
      data: { lat, lng, mood, energy, city, country, message, deleteToken },
    });

    res.json({ id: created.id, createdAt: created.createdAt, deleteToken });
  } catch (err) {
    console.error("POST /api/moods failed:", err);
    res.status(500).json({ error: "Failed to save mood" });
  }
});

// GET /api/moods?sinceMinutes=720
app.get("/api/moods", async (req, res) => {
  try {
    const sinceMinutes = parseInt(String(req.query.sinceMinutes || "720"), 10);
    const sinceDate = new Date(Date.now() - sinceMinutes * 60 * 1000);

    const moods = await prisma.mood.findMany({
      where: { createdAt: { gte: sinceDate } },
      orderBy: { createdAt: "desc" },
    });

    res.json({ data: moods });
  } catch (err) {
    console.error("GET /api/moods failed:", err);
    res.status(500).json({ error: "Failed to fetch moods" });
  }
});

// DELETE /api/moods/:id
// - with 'x-delete-token' matching row.deleteToken
// - OR owner-only: with 'x-admin-secret' == process.env.ADMIN_SECRET
app.delete("/api/moods/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const token = (req.headers["x-delete-token"] as string) || "";
    const admin = (req.headers["x-admin-secret"] as string) || "";

    const mood = await prisma.mood.findUnique({ where: { id } });
    if (!mood) return res.status(404).json({ error: "Not found" });

    const adminAllowed = ADMIN_SECRET && admin && admin === ADMIN_SECRET;
    const tokenAllowed = token && token === mood.deleteToken;

    if (!adminAllowed && !tokenAllowed) {
      return res.status(403).json({ error: "Invalid delete token" });
    }

    await prisma.mood.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/moods/:id failed:", err);
    res.status(500).json({ error: "Failed to delete mood" });
  }
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
