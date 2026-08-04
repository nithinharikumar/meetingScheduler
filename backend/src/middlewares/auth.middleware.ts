import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

// Extend Express Request interface to include the user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authorized, no token provided' } });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { id: string };

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authorized, user not found' } });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authorized, invalid token' } });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authorized' } });
      return;
    }

    if (req.user.role !== 'SuperAdmin' && !roles.includes(req.user.role)) {
      res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not authorized to access this route' } });
      return;
    }

    next();
  };
};
