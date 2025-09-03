import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { makeLimiter } from './lib/rateLimit';
import { cleanupExpired } from './lib/cleanup';
import { router as moodsRouter } from './routes/moods';

const app = express();
const prisma = new PrismaClient();

const allowedOrigins = (process.env.ORIGIN ?? '').split(',').map(s => s.trim()).filter(Boolean);

// CORS config with typed callback
app.use(cors({
  origin(origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) {
    // allow server-to-server / curl (no origin) and exact matches from env
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());
app.use(makeLimiter());

// Health
app.get('/healthz', (_req: Request, res: Response) => res.json({ ok: true }));

// API
app.use('/moods', moodsRouter);

// 404
app.use((_req: Request, res: Response) => res.status(404).json({ error: 'Not found' }));

// Error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Unexpected error' });
});

// Boot + cleanup job
const port = Number(process.env.PORT ?? 3001);
app.listen(port, async () => {
  console.log(`API listening on :${port}`);

  try {
    const n = await cleanupExpired(prisma);
    if (n) console.log(`cleanup: deleted ${n} expired moods`);
  } catch (e) {
    console.warn('cleanup on boot failed', e);
  }

  // hourly cleanup
  setInterval(() => {
    cleanupExpired(prisma).then(n => n && console.log(`cleanup: deleted ${n}`)).catch(() => {});
  }, 60 * 60 * 1000);
});
