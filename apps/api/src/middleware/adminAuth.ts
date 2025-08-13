import { Request, Response, NextFunction } from 'express';

export const validateAdminSecret = (req: Request, res: Response, next: NextFunction) => {
  const adminSecret = req.headers['x-admin-secret'] || req.body.adminSecret;
  const expectedSecret = process.env.ADMIN_SECRET;

  if (!expectedSecret) {
    console.error('ADMIN_SECRET environment variable not set');
    return res.status(500).json({ error: 'Admin authentication not configured' });
  }

  if (!adminSecret || adminSecret !== expectedSecret) {
    return res.status(401).json({ error: 'Invalid admin secret' });
  }

  next();
};