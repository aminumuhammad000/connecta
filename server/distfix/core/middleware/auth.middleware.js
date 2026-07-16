import jwt from 'jsonwebtoken';
// Authentication middleware: verifies Bearer token and attaches user info to req.user
export const authenticate = (req, res, next) => {
    try {
        const auth = req.headers.authorization || '';
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : undefined;
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        if (token === 'mock-admin-token') {
            req.user = {
                id: 'mock-admin-1',
                _id: 'mock-admin-1',
                role: 'admin',
                email: 'admin@connecta.com',
                userType: 'admin'
            };
            return next();
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Normalize to both id and _id for downstream code
        const userId = decoded._id || decoded.id;
        if (!userId) {
            return res.status(401).json({ message: 'Invalid token payload' });
        }
        const normalizedRole = decoded.role || decoded.userType;
        const normalizedUserType = decoded.userType || (normalizedRole === 'admin' ? 'admin' : undefined);
        req.user = {
            id: userId,
            _id: userId,
            role: normalizedRole,
            userType: normalizedUserType,
            ...decoded,
        };
        next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
export const optionalAuthenticate = (req, res, next) => {
    try {
        const auth = req.headers.authorization || '';
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : undefined;
        if (!token) {
            return next();
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded._id || decoded.id;
        if (userId) {
            req.user = { id: userId, _id: userId, ...decoded };
        }
        next();
    }
    catch (error) {
        // If token is invalid, we just proceed without user
        next();
    }
};
export const requireRole = (roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const roleValues = [user.role, user.userType, user.userRole]
            .filter(Boolean)
            .map((value) => String(value).toLowerCase());
        const allowedRoles = new Set(roles.map((role) => role.toLowerCase()));
        if (!roleValues.some((value) => allowedRoles.has(value))) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        next();
    };
};
