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
export default router;
