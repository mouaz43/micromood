// Minimal site + API in one service
const express = require("express");
const path = require("path");
const cors = require("cors");
const { Pool } = require("pg");

const ORIGIN = process.env.ORIGIN || "*";
const PORT = process.env.PORT || 3000;

const ssl =
  process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl
});

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pulses (
      id BIGSERIAL PRIMARY KEY,
      mood INTEGER NOT NULL CHECK (mood BETWEEN -2 AND 2),
      note TEXT,
      lat DOUBLE PRECISION NOT NULL,
      lng DOUBLE PRECISION NOT NULL,
      allow_connect BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS pulses_created_at_idx ON pulses (created_at DESC);
  `);
}

const app = express();
app.use(cors({ origin: ORIGIN, credentials: false }));
app.use(express.json({ limit: "200kb" }));

// API
app.get("/api/pulses", async (req, res) => {
  try {
    const h = Math.max(1, Math.min(72, parseInt(req.query.windowHours || "24", 10)));
    const { rows } = await pool.query(
      `SELECT id, mood, note, lat, lng, allow_connect, created_at
         FROM pulses
        WHERE created_at >= now() - INTERVAL '${h} hours'
        ORDER BY created_at DESC
        LIMIT 2000`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed_to_fetch" });
  }
});

app.post("/api/pulses", async (req, res) => {
  try {
    const { mood, note = "", lat, lng, allow_connect = false } = req.body || {};
    const m = Number(mood);
    const la = Number(lat);
    const ln = Number(lng);

    if (!Number.isFinite(la) || !Number.isFinite(ln)) {
      return res.status(400).json({ error: "invalid_location" });
    }
    if (!Number.isInteger(m) || m < -2 || m > 2) {
      return res.status(400).json({ error: "invalid_mood" });
    }
    const cleanNote = String(note).slice(0, 280);

    const { rows } = await pool.query(
      `INSERT INTO pulses (mood, note, lat, lng, allow_connect)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, mood, note, lat, lng, allow_connect, created_at`,
      [m, cleanNote, la, ln, !!allow_connect]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed_to_insert" });
  }
});

// Static site
app.use(express.static(path.join(__dirname, "..", "public")));
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

ensureTable()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Micromoon running on :${PORT}`);
    });
  })
  .catch((e) => {
    console.error("Failed to ensure table", e);
    process.exit(1);
  });
