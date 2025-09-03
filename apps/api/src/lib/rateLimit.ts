import rateLimit from 'express-rate-limit';

export function makeLimiter() {
  // Default: 60 req/min; override with env if you like
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW ?? 60_000);
  const max = Number(process.env.RATE_LIMIT_MAX ?? 60);

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false
  });
}
