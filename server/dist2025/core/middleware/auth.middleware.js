import jwt from 'jsonwebtoken';
// Authentication middleware: verifies Bearer token and attaches user info to req.user
export const authenticate = (req, res, next) => {
    try {
        const auth = req.headers.authorization || '';
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : undefined;
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Normalize to both id and _id for downstream code
        const userId = decoded._id || decoded.id;
        if (!userId) {
            return res.status(401).json({ message: 'Invalid token payload' });
        }
        req.user = { id: userId, _id: userId, ...decoded };
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
