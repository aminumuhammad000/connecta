import { Router } from 'express';
import { getSettings, updateSmtpSettings, updateApiKeys } from '../controllers/settings.controller';
import { authenticate } from '../core/middleware/auth.middleware';

const router = Router();

// Secure all settings routes
router.use(authenticate);

// TODO: Add refined authorization (e.g. admin only) for specific routes if needed
// router.use(authorize('admin'));

router.get('/', getSettings);
router.put('/smtp', updateSmtpSettings);
router.put('/api-keys', updateApiKeys);

export default router;
