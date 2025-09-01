import type { Request, Response, NextFunction } from 'express';

export function requireOwner(req: Request, res: Response, next: NextFunction) {
  const token = req.header('x-owner-password') || req.query.pass;
  if (!token || token !== process.env.OWNER_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}
