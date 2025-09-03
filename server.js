/**
 * Micromoon backend (ESM) — serves API and the static site.
 * Fixes "require is not defined in ES module scope" by using ESM imports and .mjs.
 * Works on Render with Node 18+ (tested on v24).
 *
 * Endpoints:
 *  - GET  /api/health            -> { ok: true }
 *  - GET  /api/pulses?windowHours=24&limit=1000&page=1
 *  - POST /api/pulses            -> { id, mood, note, lat, lng, allow_connect, created_at }
 *
 * Table auto-creation:
 *  - pulses(id BIGSERIAL, mood INT [-2..2], note TEXT, lat DOUBLE PRECISION, lng DOUBLE PRECISION,
 *           allow_connect BOOLEAN, created_at TIMESTAMPTZ DEFAULT now())
 *
 * Env:
 *  - DATABASE_URL     (Render Postgres "External Database URL")
 *  - ORIGIN           (optional CORS origin, e.g. https://micromoon.onrender.com)
 *  - NODE_ENV         (production|development)
 *  - PORT             (Render provides this)
 */

import express from "express";
import cors from "cors";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";
import { Pool } from "pg";

// ---------------------------------------------------------------------------
// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// Configuration
const CONFIG = {
  ORIGIN: process.env.ORIGIN || "*",
  NODE_ENV: process.env.NODE_ENV || "production",
  PORT: Number(process.env.PORT || 3000),
  DATABASE_URL: process.env.DATABASE_URL || "",
  // retention window in hours (kept generous to avoid surprise deletions)
  RETAIN_HOURS: Number(process.env.RETAIN_HOURS || 48),
  // polling interval for retention (ms)
  RETAIN_INTERVAL_MS: Number(process.env.RETAIN_INTERVAL_MS || 30 * 60 * 1000), // 30min
  // basic in-memory rate limit
  RATE_WINDOW_MS: Number(process.env.RATE_WINDOW_MS || 60 * 1000),
  RATE_MAX_POSTS: Number(process.env.RATE_MAX_POSTS || 8),
};

// Validate required env
if (!CONFIG.DATABASE_URL) {
  console.error("[BOOT] DATABASE_URL is not set. Set it in Render → Environment → Variables.");
}

// SSL for Render Postgres (require TLS)
const pgSSL =
  CONFIG.NODE_ENV === "production"
    ? { rejectUnauthorized: false } // Render provides a trusted CA; false is OK here
    : false;

const pool = new Pool({
  connectionString: CONFIG.DATABASE_URL,
  ssl: pgSSL,
});

// ---------------------------------------------------------------------------
// Database bootstrap: table + index
async function ensureSchema() {
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
  console.log("[DB] Schema ensured.");
}

// ---------------------------------------------------------------------------
// Utilities
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const isFiniteNum = (x) => Number.isFinite(x) && !Number.isNaN(x);

// Very small in-memory rate limiter (per IP)
// Note: Render instances are ephemeral; this is only to avoid spam bursts.
// For production at scale, move to Redis.
class RateLimiter {
  constructor(max, windowMs) {
    this.max = max;
    this.windowMs = windowMs;
    this.map = new Map(); // ip -> { count, reset }
    setInterval(() => this.sweep(), Math.min(windowMs, 60_000)).unref?.();
  }
  allow(ip) {
    const now = Date.now();
    const rec = this.map.get(ip);
    if (!rec || now > rec.reset) {
      this.map.set(ip, { count: 1, reset: now + this.windowMs });
      return true;
    }
    if (rec.count < this.max) {
      rec.count++;
      return true;
    }
    return false;
  }
  sweep() {
    const now = Date.now();
    for (const [ip, rec] of this.map.entries()) {
      if (now > rec.reset) this.map.delete(ip);
    }
  }
}
const limiter = new RateLimiter(CONFIG.RATE_MAX_POSTS, CONFIG.RATE_WINDOW_MS);

// Simple logger
function log(req, res, next) {
  const t0 = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - t0;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });
  next();
}

// ---------------------------------------------------------------------------
// Express app
const app = express();
app.disable("x-powered-by");
app.use(log);
app.use(
  cors({
    origin: CONFIG.ORIGIN,
    credentials: false,
  })
);
app.use(express.json({ limit: "256kb" }));

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// GET /api/pulses
app.get("/api/pulses", async (req, res) => {
  try {
    const windowHours = clamp(parseInt(req.query.windowHours ?? "24", 10) || 24, 1, 72);
    const limit = clamp(parseInt(req.query.limit ?? "1500", 10) || 1500, 1, 5000);
    const page = clamp(parseInt(req.query.page ?? "1", 10) || 1, 1, 10000);
    const offset = (page - 1) * limit;

    const { rows } = await pool.query(
      `SELECT id, mood, note, lat, lng, allow_connect, created_at
         FROM pulses
        WHERE created_at >= now() - INTERVAL '${windowHours} hours'
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    res.json(rows);
  } catch (e) {
    console.error("[GET /api/pulses] error:", e);
    res.status(500).json({ error: "failed_to_fetch" });
  }
});

// POST /api/pulses
app.post("/api/pulses", async (req, res) => {
  try {
    const ip =
      req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() ||
      req.socket.remoteAddress ||
      "unknown";

    if (!limiter.allow(ip)) {
      return res.status(429).json({ error: "rate_limited" });
    }

    const { mood, note = "", lat, lng, allow_connect = false } = req.body || {};
    const m = Number(mood);
    const la = Number(lat);
    const ln = Number(lng);

    if (!Number.isInteger(m) || m < -2 || m > 2) {
      return res.status(400).json({ error: "invalid_mood" });
    }
    if (!isFiniteNum(la) || !isFiniteNum(ln) || Math.abs(la) > 90 || Math.abs(ln) > 180) {
      return res.status(400).json({ error: "invalid_location" });
    }
    const cleanNote = String(note).slice(0, 280); // UI also limits, this is server-side guard

    const { rows } = await pool.query(
      `INSERT INTO pulses (mood, note, lat, lng, allow_connect)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, mood, note, lat, lng, allow_connect, created_at`,
      [m, cleanNote, la, ln, !!allow_connect]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error("[POST /api/pulses] error:", e);
    res.status(500).json({ error: "failed_to_insert" });
  }
});

// ---------------------------------------------------------------------------
// Static site from /public (same host as API)
const PUBLIC_DIR = path.join(__dirname, "..", "public");
app.use(express.static(PUBLIC_DIR));
app.get("*", (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

// ---------------------------------------------------------------------------
// Retention: remove posts older than RETAIN_HOURS
async function retentionSweep() {
  try {
    const hrs = clamp(CONFIG.RETAIN_HOURS, 24, 168); // keep [24..168] hours on server
    const { rowCount } = await pool.query(
      `DELETE FROM pulses WHERE created_at < now() - INTERVAL '${hrs} hours'`
    );
    if (rowCount) console.log(`[RETENTION] removed ${rowCount} old rows (> ${hrs}h)`);
  } catch (e) {
    console.warn("[RETENTION] failed:", e.message);
  }
}
setInterval(retentionSweep, CONFIG.RETAIN_INTERVAL_MS).unref?.();

// ---------------------------------------------------------------------------
// Boot
async function boot() {
  console.log("[BOOT] Micromoon starting…");
  console.log(`[BOOT] Node: ${process.version} | ESM mode`);
  console.log(`[BOOT] CORS origin: ${CONFIG.ORIGIN}`);
  await ensureSchema();
  app.listen(CONFIG.PORT, () => {
    console.log(`[HTTP] listening on :${CONFIG.PORT}`);
  });
  // initial gentle sweep after start
  await sleep(3000);
  retentionSweep();
}

// Graceful shutdown
function shutdown(signame) {
  console.log(`[SHUTDOWN] ${signame} received. Closing…`);
  pool
    .end()
    .catch(() => {})
    .finally(() => process.exit(0));
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

boot().catch((e) => {
  console.error("[FATAL] boot failed:", e);
  process.exit(1);
});
