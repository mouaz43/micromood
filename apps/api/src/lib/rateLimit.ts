import rateLimit from 'express-rate-limit';

export function limiter() {
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW ?? 60_000);
  const max = Number(process.env.RATE_LIMIT_MAX ?? 120);
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false
  });
}
