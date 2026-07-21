import { Router } from 'express';
import { getAnalyticsStats } from '../controllers/Analytics.controller.js';
import { authenticate } from '../core/middleware/auth.middleware.js';
import { isAdmin } from '../core/middleware/admin.middleware.js';
const router = Router();
// All analytics routes require admin access
router.use(authenticate, isAdmin);
// Get analytics statistics
router.get('/stats', getAnalyticsStats);
export default router;
