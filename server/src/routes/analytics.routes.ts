import express from 'express';
import { getAnalyticsStats } from '../controllers/analytics.controller';

const router = express.Router();

// Admin: Get analytics stats (no auth for admin panel)
router.get('/stats', getAnalyticsStats);

export default router;
