import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();

const WEB_ORIGIN = process.env.WEB_ORIGIN || "*";
const OWNER_KEY  = process.env.OWNER_KEY || ""; // set on Render → Environment

app.use(cors({ origin: WEB_ORIGIN, credentials: false }));
app.use(express.json({ limit: "256kb" }));

// 30s simple rate limit (per IP)
app.use(
  rateLimit({
    windowMs: 30_000,
    max: 6,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/healthz", (_req, res) => res.send("ok"));

// GET recent moods (last N minutes, default 12h) and auto-expire >24h
app.get("/moods", async (req, res) => {
  try {
    const sinceMinutes = Math.min(
      24 * 60,
      Math.max(5, Number(req.query.sinceMinutes) || 720)
    );
    const since = new Date(Date.now() - sinceMinutes * 60_000);
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const items = await prisma.mood.findMany({
      where: {
        createdAt: { gte: since, gt: dayAgo },
        // unlockAt either in past or null
        OR: [{ unlockAt: null }, { unlockAt: { lte: new Date() } }],
      },
      orderBy: { createdAt: "desc" },
      take: 1500,
    });

    // do not leak deleteToken
    const safe = items.map(({ deleteToken, ...rest }) => rest);
    res.json({ data: safe });
  } catch (e) {
    res.status(500).json({ error: "Unexpected error" });
  }
});

// POST create mood
app.post("/moods", async (req, res) => {
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

    const deleteToken = cryptoRandom(24);

    const created = await prisma.mood.create({
      data: {
        mood,
        energy,
        text: typeof text === "string" ? text.slice(0, 160) : null,
        lat,
        lng,
        deleteToken,
        unlockAt: unlockAt ? new Date(unlockAt) : null,
      },
    });

    res.status(201).json({
      data: { id: created.id, deleteToken: created.deleteToken },
    });
  } catch (e) {
    res.status(500).json({ error: "Unexpected error" });
  }
});

// DELETE self (by id + delete token)
app.delete("/moods/:id", async (req, res) => {
  try {
    const id = String(req.params.id);
    const token = String(req.header("x-delete-token") || "");
    if (!token) return res.status(401).json({ error: "Missing token" });

    const found = await prisma.mood.findUnique({ where: { id } });
    if (!found || found.deleteToken !== token)
      return res.status(403).json({ error: "Forbidden" });

    await prisma.mood.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Unexpected error" });
  }
});

// OWNER: rectangle delete (moonbeam)
app.delete("/owner/moods", async (req, res) => {
  try {
    const key = String(req.header("x-owner-key") || "");
    if (!OWNER_KEY || key !== OWNER_KEY) {
      return res.status(401).json({ error: "Invalid owner key" });
    }
    const { north, south, east, west } = req.body || {};
    if (
      [north, south, east, west].some((v) => typeof v !== "number") ||
      south > north ||
      west > east
    ) {
      return res.status(400).json({ error: "Invalid bounds" });
    }

    const result = await prisma.$executeRawUnsafe(
      `DELETE FROM "Mood"
       WHERE "lat" BETWEEN $1 AND $2
         AND "lng" BETWEEN $3 AND $4`,
      south,
      north,
      west,
      east
    );

    res.json({ deleted: Number(result) || 0 });
  } catch (e) {
    res.status(500).json({ error: "Unexpected error" });
  }
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 10000;
app.listen(PORT, () =>
  console.log(`API listening on http://localhost:${PORT}`)
);

/** small crypto-safe token */
function cryptoRandom(len = 24) {
  const buf = Buffer.alloc(len);
  crypto.getRandomValues(buf as unknown as Uint8Array);
  return buf.toString("base64url");
}

// Node <19 shim
const crypto = globalThis.crypto ?? require("crypto").webcrypto;
