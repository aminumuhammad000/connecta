import { Router } from 'express';
import { getAllSubscriptions, getSubscriptionStats, cancelSubscription, reactivateSubscription, deleteSubscription, } from '../controllers/Subscription.controller.js';
import { authenticate } from '../core/middleware/auth.middleware.js';
import { isAdmin } from '../core/middleware/admin.middleware.js';
const router = Router();
// Get all subscriptions (admin)
router.get('/admin/all', authenticate, isAdmin, getAllSubscriptions);
// Get subscription statistics (admin)
router.get('/admin/stats', authenticate, isAdmin, getSubscriptionStats);
// Cancel subscription
router.patch('/:subscriptionId/cancel', authenticate, cancelSubscription);
// Reactivate subscription
router.patch('/:subscriptionId/reactivate', authenticate, reactivateSubscription);
// Delete subscription
router.delete('/:subscriptionId', authenticate, deleteSubscription);
export default router;
