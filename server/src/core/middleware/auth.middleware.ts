import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Authentication middleware: verifies Bearer token and attaches user info to req.user
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : undefined;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id?: string;
      _id?: string;
      [key: string]: any;
    };

    // Normalize to both id and _id for downstream code
    const userId = decoded._id || decoded.id;
    if (!userId) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    (req as any).user = { id: userId, _id: userId, ...decoded };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
