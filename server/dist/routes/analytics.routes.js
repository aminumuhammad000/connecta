import express from 'express';
import { getAnalyticsStats } from '../controllers/analytics.controller.js';
const router = express.Router();
// Admin: Get analytics stats (no auth for admin panel)
router.get('/stats', getAnalyticsStats);
export default router;
