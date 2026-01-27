import { Router } from 'express';
import {
  getClientDashboard,
  getFreelancerDashboard,
  getTopFreelancers,
  getRecentMessages,
  getAdminStats,
  getActiveProjects,
} from '../controllers/Dashboard.controller.js';
import { authenticate } from '../core/middleware/auth.middleware.js';

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

// Get client dashboard stats
router.get('/stats', getClientDashboard);

// Get active projects for client
router.get('/active-projects', getActiveProjects);

// Get admin dashboard stats
router.get('/admin/stats', getAdminStats);

// Get freelancer dashboard stats
router.get('/freelancer/stats', getFreelancerDashboard);

// Get top freelancers recommendations
router.get('/freelancers', getTopFreelancers);

// Get recent messages for dashboard
router.get('/messages', getRecentMessages);

export default router;
