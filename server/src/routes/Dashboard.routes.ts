import { Router } from 'express';
import {
  getClientDashboard,
  getFreelancerDashboard,
  getTopFreelancers,
  getRecentMessages,
} from '../controllers/Dashboard.controller';
import { authenticate } from '../core/middleware/auth.middleware';

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

// Get client dashboard stats
router.get('/stats', getClientDashboard);

// Get freelancer dashboard stats
router.get('/freelancer/stats', getFreelancerDashboard);

// Get top freelancers recommendations
router.get('/freelancers', getTopFreelancers);

// Get recent messages for dashboard
router.get('/messages', getRecentMessages);

export default router;
