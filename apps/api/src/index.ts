import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import moods from './routes/moods';
import { buildCors } from './lib/cors';
import { limiter } from './lib/rateLimit';
import { purgeExpired, scheduleJanitor } from './lib/cleanup';

const app = express();
const prisma = new PrismaClient();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(buildCors());
app.use(express.json({ limit: '200kb' }));
app.use(morgan('tiny'));
app.use(limiter());

app.get('/healthz', (_req: Request, res: Response) => res.json({ ok: true }));

app.use('/moods', moods);

app.use((_req: Request, res: Response) => res.status(404).json({ error: 'not found' }));
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'unexpected' });
});

const PORT = Number(process.env.PORT || 10000);
app.listen(PORT, async () => {
  console.log(`API on :${PORT}`);
  try {
    const n = await purgeExpired(prisma);
    if (n) console.log(`purged ${n} expired`);
  } catch {}
  scheduleJanitor(prisma);
});
