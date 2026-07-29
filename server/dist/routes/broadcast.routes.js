import express from 'express';
import { sendBroadcast } from '../controllers/broadcast.controller.js';
import { authenticate } from '../core/middleware/auth.middleware.js';
import { isAdmin } from '../core/middleware/admin.middleware.js';
const router = express.Router();
/**
 * @route   POST /api/broadcast/email
 * @desc    Send broadcast email to users
 * @access  Private (Admin)
 */
router.post('/email', authenticate, isAdmin, sendBroadcast);
export default router;
