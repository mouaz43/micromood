import cors, { type CorsOptionsDelegate } from 'cors';

export function buildCors() {
  const allow = (process.env.WEB_ORIGIN ?? '*')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const origin: CorsOptionsDelegate = (
    origin: string | undefined,
    cb: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin || allow.length === 0 || allow.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  };

  return cors({
    origin,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    credentials: false
  });
}
