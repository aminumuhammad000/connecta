import { Router } from 'express';
import { getMySubscription, initializeUpgradePayment, verifyUpgradePayment, cancelSubscription, } from '../controllers/Subscription.controller';
import { authenticate } from '../core/middleware/auth.middleware';
const router = Router();
// All subscription routes require authentication
router.use(authenticate);
// Get current user's subscription
router.get('/me', getMySubscription);
// Initialize upgrade payment
router.post('/initialize-upgrade', initializeUpgradePayment);
// Verify upgrade payment
router.post('/verify-upgrade', verifyUpgradePayment);
// Cancel subscription
router.post('/cancel', cancelSubscription);
// Admin routes
import { getAllSubscriptions, getSubscriptionStats, adminCancelSubscription, adminReactivateSubscription, adminDeleteSubscription } from '../controllers/Subscription.controller';
router.get('/admin/all', getAllSubscriptions);
router.get('/admin/stats', getSubscriptionStats);
router.patch('/:id/cancel', adminCancelSubscription);
router.patch('/:id/reactivate', adminReactivateSubscription);
router.delete('/:id', adminDeleteSubscription);
export default router;
