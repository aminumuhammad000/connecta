import { Router } from 'express';
import {
    getMySubscription,
    upgradeSubscription,
    cancelSubscription,
} from '../controllers/Subscription.controller';
import { authenticate } from '../core/middleware/auth.middleware';

const router = Router();

// All subscription routes require authentication
router.use(authenticate);

// Get current user's subscription
router.get('/me', getMySubscription);

// Upgrade subscription
router.post('/upgrade', upgradeSubscription);

// Cancel subscription
router.post('/cancel', cancelSubscription);

export default router;
