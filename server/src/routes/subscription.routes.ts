import express from 'express';
import {
  getAllSubscriptions,
  getSubscriptionStats,
  cancelSubscription,
  reactivateSubscription,
  deleteSubscription,
} from '../controllers/subscription.controller';

const router = express.Router();

// Admin routes
router.get('/admin/all', getAllSubscriptions);
router.get('/admin/stats', getSubscriptionStats);
router.patch('/:id/cancel', cancelSubscription);
router.patch('/:id/reactivate', reactivateSubscription);
router.delete('/:id', deleteSubscription);

export default router;
