import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      // Use index signature to allow any property (for compatibility with JWT middlewares)
      user?: {
        [key: string]: any;
      };
    }
  }
}

export {};
