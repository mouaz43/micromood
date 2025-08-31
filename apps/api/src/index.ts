import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { PrismaClient } from "@prisma/client";
import { buildMoodsRouter } from "./routes/moods.js";

const prisma = new PrismaClient();
const app = express();

// Allow your web origin (or * while testing)
const WEB_ORIGIN = process.env.WEB_ORIGIN || "*";
const OWNER_KEY = process.env.OWNER_KEY || "";

app.use(cors({ origin: WEB_ORIGIN }));
app.use(express.json({ limit: "256kb" }));

// Basic rate limiting to avoid spam
app.use(
  rateLimit({
    windowMs: 30_000,
    max: 6,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get("/healthz", (_req, res) => res.send("ok"));

// moods routes
app.use("/moods", buildMoodsRouter(prisma));

// owner bulk delete by rectangle (requires x-owner-key header)
app.delete("/owner/moods", async (req, res) => {
  try {
    const key = String(req.header("x-owner-key") || "");
    if (!OWNER_KEY || key !== OWNER_KEY) {
      return res.status(401).json({ error: "Invalid owner key" });
    }
    const { north, south, east, west } = req.body ?? {};
    if (
      [north, south, east, west].some((v) => typeof v !== "number") ||
      south > north ||
      west > east
    ) {
      return res.status(400).json({ error: "Invalid bounds" });
    }

    const deletedCount = await prisma.$executeRawUnsafe(
      `DELETE FROM "Mood"
       WHERE "lat" BETWEEN $1 AND $2
         AND "lng" BETWEEN $3 AND $4`,
      south,
      north,
      west,
      east
    );

    res.json({ deleted: Number(deletedCount) || 0 });
  } catch {
    res.status(500).json({ error: "Unexpected error" });
  }
});

const PORT = Number(process.env.PORT || 10000);
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
