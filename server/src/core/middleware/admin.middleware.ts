import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if the authenticated user is an admin
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: No user found'
        });
    }

    if (user.userType !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Admin access required'
        });
    }

    next();
};
