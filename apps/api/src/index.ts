import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { moodsRouter } from './routes/moods';

// ---- Config -----------------------------------------------------
const PORT = Number(process.env.PORT || 10000);

// Allow your static site origin (and localhost for testing)
const WEB_ORIGIN = process.env.WEB_ORIGIN ?? '*';

// ---- App --------------------------------------------------------
const app = express();

// security + body parsing
app.use(helmet());
app.use(express.json({ limit: '100kb' }));

// CORS
app.use(
  cors({
    origin: WEB_ORIGIN === '*' ? true : [WEB_ORIGIN],
    credentials: false
  })
);

// Rate limit (basic)
app.use(
  '/moods',
  rateLimit({
    windowMs: 60 * 1000,
    limit: 40,
    standardHeaders: 'draft-7',
    legacyHeaders: false
  })
);

// Health
app.get('/healthz', (_req, res) => res.status(200).send('OK'));

// API
app.use('/moods', moodsRouter);

// 404
app.use((_req, res) => res.status(404).send('Not found'));

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Unexpected error' });
});

app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});
