import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import moods from './routes/moods';
import { makeLimiter } from './lib/rateLimit';
import { requireOwner } from './lib/auth';
import { cleanExpired } from './lib/cleanup';

const app = express();

const WEB_ORIGIN = process.env.WEB_ORIGIN || '*';

app.use(helmet());
app.use(cors({ origin: WEB_ORIGIN, methods: ['GET','POST','DELETE'] }));
app.use(bodyParser.json({ limit: '100kb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(makeLimiter(60_000, 120));

app.get('/healthz', (_req, res) => res.json({ ok: true }));

app.use('/moods', moods);

// admin cleanup (password required)
app.post('/admin/cleanup', requireOwner, async (_req, res) => {
  const count = await cleanExpired();
  res.json({ removed: count });
});

// background janitor
setInterval(() => cleanExpired().catch(() => {}), 5 * 60 * 1000);

const port = Number(process.env.PORT || 10000);
app.listen(port, () => {
  console.log(`API listening on :${port}`);
});
