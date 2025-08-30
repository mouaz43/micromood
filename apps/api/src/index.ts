import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma.js";
import { router as moods } from "./routes/moods.js";

dotenv.config();

const app = express();

/** --- Middleware --- */
app.use(
  cors({
    origin: true, // reflect request origin
    credentials: false
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

/** --- Friendly root --- */
app.get("/", (_req: Request, res: Response) => {
  res
    .type("text")
    .send(
      "MicroMood API is running.\n" +
        "Try:\n" +
        "  • GET /healthz\n" +
        "  • GET /debug/db\n" +
        "  • POST /api/moods"
    );
});

/** --- Health check --- */
app.get("/healthz", (_req: Request, res: Response) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

/** --- DB probe (helps debug 500s) --- */
app.get("/debug/db", async (_req: Request, res: Response) => {
  try {
    // Simple round-trip query
    // biome-ignore lint/suspicious/noExplicitAny: tagged template for prisma raw query
    await prisma.$queryRaw<any>`SELECT 1`;
    res.json({ db: "ok" });
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error("DB probe failed:", e);
    res.status(500).json({
      db: "error",
      message: e?.message ?? "Unknown DB error"
    });
  }
});

/** --- Feature routes --- */
app.use("/api/moods", moods);

/** --- 404 --- */
app.use((_req, res) => {
  res.status(404).json({ error: "Not Found" });
});

/** --- Centralized error handler --- */
app.use(
  // biome-ignore lint/suspicious/noExplicitAny: express error handler signature
  (err: any, _req: Request, res: Response, _next: NextFunction) => {
    // eslint-disable-next-line no-console
    console.error("Unhandled error:", err);
    const status = typeof err?.status === "number" ? err.status : 500;
    res
      .status(status)
      .json({ error: "Internal Server Error", message: err?.message ?? "Unknown error" });
  }
);

/** --- Start server --- */
const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
});
