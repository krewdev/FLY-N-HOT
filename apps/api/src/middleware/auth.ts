import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../db.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
        email: string;
      };
      pilotId?: string;
    }
  }
}

export interface AuthRequest extends Request {}

// Middleware to verify JWT token (placeholder implementation)
export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    
    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { userId: decoded.userId },
      include: { pilotProfile: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token - user not found' });
    }

    req.user = {
      userId: user.userId,
      role: user.role,
      email: user.email
    };

    // Set pilotId if user is a pilot
    if (user.pilotProfile) {
      req.pilotId = user.pilotProfile.pilotId;
    }

    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Middleware to require pilot role
export const requirePilot = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'PILOT') {
    return res.status(403).json({ error: 'Pilot access required' });
  }
  
  if (!req.pilotId) {
    return res.status(403).json({ error: 'Pilot profile not found' });
  }

  next();
};

// Middleware to require admin role
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};

// Temporary middleware for development - allows bypassing auth with query param
export const tempAuthBypass = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Only allow in development
  if (env.NODE_ENV === 'production') {
    return authenticateToken(req, res, next);
  }

  const pilotId = req.query.pilotId as string;
  if (pilotId) {
    try {
      const pilot = await prisma.pilotProfile.findUnique({
        where: { pilotId },
        include: { user: true }
      });

      if (pilot) {
        req.user = {
          userId: pilot.user.userId,
          role: pilot.user.role,
          email: pilot.user.email
        };
        req.pilotId = pilot.pilotId;
      }
    } catch (error) {
      console.error('Failed to bypass auth:', error);
    }
  }

  next();
};
