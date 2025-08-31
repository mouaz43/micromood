import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import moodsRouter from "./routes/moods";

const app = express();

// CORS: allow only your static site
const ORIGIN = process.env.WEB_ORIGIN || "*";
app.use(cors({ origin: ORIGIN, methods: ["GET", "POST", "DELETE", "OPTIONS"] }));

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(morgan("tiny"));

app.get("/healthz", (_req, res) => res.status(200).send("ok"));
app.use("/moods", moodsRouter);

const PORT = Number(process.env.PORT || 10000);
app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});
