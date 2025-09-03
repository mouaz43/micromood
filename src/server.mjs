import express from "express";
import cors from "cors";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";
import { Pool } from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- config
const CFG = {
  ORIGIN: process.env.ORIGIN || "*",
  NODE_ENV: process.env.NODE_ENV || "production",
  PORT: Number(process.env.PORT || 3000),
  DATABASE_URL: process.env.DATABASE_URL || "",
  RETAIN_HOURS: Number(process.env.RETAIN_HOURS || 48),
  RETAIN_INTERVAL_MS: Number(process.env.RETAIN_INTERVAL_MS || 30 * 60 * 1000),
  RATE_WINDOW_MS: Number(process.env.RATE_WINDOW_MS || 60 * 1000),
  RATE_MAX_POSTS: Number(process.env.RATE_MAX_POSTS || 8)
};
const clamp = (n,a,b)=>Math.max(a,Math.min(b,n));
if (!CFG.DATABASE_URL) console.error("[BOOT] DATABASE_URL missing");

// ---------- db
const pool = new Pool({
  connectionString: CFG.DATABASE_URL,
  ssl: CFG.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

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
  console.log("[DB] schema ready");
}

// ---------- tiny rate limiter
class Limiter {
  constructor(max, win){ this.max=max; this.win=win; this.map=new Map();
    setInterval(()=>this.sweep(), Math.min(win,60000)).unref?.(); }
  allow(ip){ const now=Date.now(), rec=this.map.get(ip);
    if(!rec||now>rec.reset){ this.map.set(ip,{count:1,reset:now+this.win}); return true; }
    if(rec.count < this.max){ rec.count++; return true; } return false; }
  sweep(){ const now=Date.now(); for(const [ip,rec] of this.map) if(now>rec.reset) this.map.delete(ip); }
}
const limiter = new Limiter(CFG.RATE_MAX_POSTS, CFG.RATE_WINDOW_MS);

// ---------- app
const app = express();
app.disable("x-powered-by");
app.use((req,res,next)=>{ const t=Date.now(); res.on("finish",()=>console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now()-t}ms`)); next(); });
app.use(cors({ origin: CFG.ORIGIN }));
app.use(express.json({ limit:"256kb" }));

// ---- API routes
app.get("/api/health", (_req,res)=> res.json({ ok:true, ts:new Date().toISOString() }));

app.get("/api/version", (_req,res)=> res.json({
  ok:true, entry:"server.mjs", node:process.version, env:CFG.NODE_ENV
}));

app.get("/api/pulses", async (req,res)=>{
  try{
    const windowHours = clamp(parseInt(req.query.windowHours ?? "24", 10) || 24, 1, 72);
    const limit = clamp(parseInt(req.query.limit ?? "1500", 10) || 1500, 1, 5000);
    const page  = clamp(parseInt(req.query.page ?? "1", 10) || 1, 1, 10000);
    const offset = (page-1)*limit;

    const { rows } = await pool.query(
      `SELECT id, mood, note, lat, lng, allow_connect, created_at
         FROM pulses
        WHERE created_at >= now() - INTERVAL '${windowHours} hours'
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2`, [limit, offset]
    );
    res.json(rows);
  }catch(e){ console.error("[GET /api/pulses]", e); res.status(500).json({ error:"failed_to_fetch" }); }
});

app.post("/api/pulses", async (req,res)=>{
  try{
    const ip = req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() || req.socket.remoteAddress || "unknown";
    if(!limiter.allow(ip)) return res.status(429).json({ error:"rate_limited" });

    const { mood, note="", lat, lng, allow_connect=false } = req.body || {};
    const m = Number(mood), la = Number(lat), ln = Number(lng);
    if(!Number.isInteger(m) || m < -2 || m > 2) return res.status(400).json({ error:"invalid_mood" });
    if(!Number.isFinite(la) || !Number.isFinite(ln) || Math.abs(la)>90 || Math.abs(ln)>180)
      return res.status(400).json({ error:"invalid_location" });

    const cleanNote = String(note).slice(0,280);

    const { rows } = await pool.query(
      `INSERT INTO pulses (mood, note, lat, lng, allow_connect)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, mood, note, lat, lng, allow_connect, created_at`,
      [m, cleanNote, la, ln, !!allow_connect]
    );
    res.status(201).json(rows[0]);
  }catch(e){ console.error("[POST /api/pulses]", e); res.status(500).json({ error:"failed_to_insert" }); }
});

// ---- static site last
const PUBLIC_DIR = path.join(__dirname, "..", "public");
app.use(express.static(PUBLIC_DIR));
app.get("*", (_req,res)=> res.sendFile(path.join(PUBLIC_DIR, "index.html")));

// ---- retention + boot + shutdown
async function retention(){
  try{
    const hrs = clamp(CFG.RETAIN_HOURS, 24, 168);
    const { rowCount } = await pool.query(`DELETE FROM pulses WHERE created_at < now() - INTERVAL '${hrs} hours'`);
    if(rowCount) console.log(`[RETENTION] removed ${rowCount} rows (> ${hrs}h)`);
  }catch(e){ console.warn("[RETENTION] failed:", e.message); }
}
setInterval(retention, CFG.RETAIN_INTERVAL_MS).unref?.();

async function boot(){
  console.log("[BOOT] server.mjs starting — Node", process.version);
  console.log("[BOOT] CORS origin:", CFG.ORIGIN);
  await ensureSchema();
  app.listen(CFG.PORT, ()=> console.log(`[HTTP] listening on :${CFG.PORT}`));
  await sleep(3000); retention();
}
function shutdown(sig){ console.log(`[SHUTDOWN] ${sig}`); pool.end().finally(()=>process.exit(0)); }
process.on("SIGINT", ()=>shutdown("SIGINT"));
process.on("SIGTERM", ()=>shutdown("SIGTERM"));
boot().catch(e=>{ console.error("[FATAL]", e); process.exit(1); });
