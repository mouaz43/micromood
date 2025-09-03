import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import corsMiddleware from './lib/cors.js';
import { sendLimiter } from './lib/rateLimit.js';
import moodsRouter from './routes/moods.js';

const app = express();

app.set('trust proxy', true);
app.use(corsMiddleware);
app.use(bodyParser.json({ limit: '128kb' }));

// Health
app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// API
app.use('/moods', sendLimiter, moodsRouter);

// Not found
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'not_found' });
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  if (err && typeof err === 'object' && 'issues' in (err as any)) {
    return res.status(400).json({ error: 'validation_error', details: (err as any).issues });
  }
  res.status(500).json({ error: 'internal_error' });
});

const PORT = Number(process.env.PORT ?? 10000);
app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});
