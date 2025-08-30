import express from "express";
import cors from "cors";
import morgan from "morgan";
import { router as moodsRouter } from "./routes/moods.js";

const app = express();

// CORS – allow web app origin; fallback to * for now.
app.use(cors({
  origin: true,
  credentials: false,
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-delete-token"]
}));

app.use(express.json());
app.use(morgan("tiny"));

app.get("/healthz", (_req, res) => res.json({ ok: true }));

app.use("/api/moods", moodsRouter);

// default 404
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

const PORT = process.env.PORT ? Number(process.env.PORT) : 10000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
