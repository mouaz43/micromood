import type { Request, Response, NextFunction } from 'express';

export function requireOwner(req: Request, res: Response, next: NextFunction) {
  const ownerKey = process.env.OWNER_KEY;
  if (!ownerKey) return res.status(501).json({ error: 'Owner mode not configured' });

  const provided = req.header('x-owner-key');
  if (provided !== ownerKey) return res.status(401).json({ error: 'Unauthorized' });

  next();
}
