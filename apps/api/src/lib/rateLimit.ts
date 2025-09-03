import rateLimit from 'express-rate-limit';

export const sendLimiter = rateLimit({
  windowMs: 60_000, // 1 minute
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false
});

export default sendLimiter;
