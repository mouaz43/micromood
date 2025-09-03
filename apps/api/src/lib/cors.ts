import cors from 'cors';

export function buildCors() {
  const allow = (process.env.WEB_ORIGIN ?? '*')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  return cors({
    origin(origin, cb) {
      if (!origin || allow.length === 0 || allow.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    methods: ['GET','POST','DELETE','OPTIONS'],
    credentials: false
  });
}
