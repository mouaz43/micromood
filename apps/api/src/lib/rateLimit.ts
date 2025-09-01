import rateLimit from 'express-rate-limit';

export const makeLimiter = (windowMs = 60_000, max = 60) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests. Slow down a bit.',
  });
