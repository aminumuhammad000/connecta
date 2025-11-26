import express from 'express';
import {
  createSubscription,
  getAllSubscriptions,
  getUserSubscription,
  cancelSubscription,
  getSubscriptionStats,
} from '../controllers/subscription.controller';
import { authenticate } from '../core/middleware/auth.middleware';

const router = express.Router();

// Admin: Get all subscriptions (no auth)
router.get('/admin/all', getAllSubscriptions);

// Admin: Get subscription stats (no auth)
router.get('/admin/stats', getSubscriptionStats);

// Create subscription (protected)
router.post('/', authenticate, createSubscription);

// Get user subscription (protected)
router.get('/my-subscription', authenticate, getUserSubscription);

// Cancel subscription (protected)
router.patch('/:subscriptionId/cancel', authenticate, cancelSubscription);

export default router;
