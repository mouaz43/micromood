import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import bodyParser from "body-parser";
import crypto from "crypto";

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-delete-token"],
  })
);

app.use(bodyParser.json());

// POST /api/moods
app.post("/api/moods", async (req, res) => {
  try {
    const { lat, lng, mood, energy, city, country, message } = req.body;
    const deleteToken = crypto.randomUUID();

    const moodEntry = await prisma.mood.create({
      data: { lat, lng, mood, energy, city, country, message, deleteToken },
    });

    res.json({
      id: moodEntry.id,
      createdAt: moodEntry.createdAt,
      deleteToken,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save mood" });
  }
});

// GET /api/moods
app.get("/api/moods", async (req, res) => {
  try {
    const sinceMinutes = parseInt(req.query.sinceMinutes as string) || 720;
    const sinceDate = new Date(Date.now() - sinceMinutes * 60000);

    const moods = await prisma.mood.findMany({
      where: { createdAt: { gte: sinceDate } },
      orderBy: { createdAt: "desc" },
    });

    res.json({ data: moods });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch moods" });
  }
});

// DELETE /api/moods/:id
app.delete("/api/moods/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers["x-delete-token"] as string;

    if (!token) return res.status(400).json({ error: "Missing delete token" });

    const mood = await prisma.mood.findUnique({ where: { id } });
    if (!mood) return res.status(404).json({ error: "Not found" });

    if (mood.deleteToken !== token) {
      return res.status(403).json({ error: "Invalid delete token" });
    }

    await prisma.mood.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete mood" });
  }
});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
