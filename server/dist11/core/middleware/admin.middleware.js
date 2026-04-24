import User from '../../models/user.model.js';
/**
 * Middleware to check if the authenticated user is an admin
 */
export const isAdmin = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: No user found'
            });
        }
        // Check if userType exists in the token payload
        let userType = user.userType;
        // Fallback: If userType is missing (older token), fetch from DB
        if (!userType) {
            console.log(`[AdminMiddleware] userType missing in token for user ${user.id}. Fetching from DB...`);
            const dbUser = await User.findById(user.id).select('userType');
            if (!dbUser) {
                console.log(`[AdminMiddleware] User ${user.id} not found in database (orphaned token).`);
                return res.status(401).json({
                    success: false,
                    message: 'Session expired or user not found. Please log in again.'
                });
            }
            userType = dbUser.userType;
            // Update req.user for downstream use
            req.user.userType = userType;
        }
        if (userType !== 'admin') {
            const currentRole = userType || 'missing';
            const debugMsg = `Forbidden: Admin access required. Current Role: ${currentRole}`;
            console.log(`[AdminMiddleware] ${debugMsg} (User: ${user.id})`);
            return res.status(403).json({
                success: false,
                message: debugMsg
            });
        }
        next();
    }
    catch (error) {
        console.error('[AdminMiddleware] Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during authorization'
        });
    }
};
