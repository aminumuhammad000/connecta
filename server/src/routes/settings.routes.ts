import { Router } from 'express';
import { getSettings, updateSmtpSettings, updateApiKeys } from '../controllers/settings.controller';
// import { authenticate, authorize } from '../core/middleware/auth.middleware'; // Assuming we have auth middleware

const router = Router();

// TODO: Add authentication and authorization (admin only)
// router.use(authenticate);
// router.use(authorize('admin'));

router.get('/', getSettings);
router.put('/smtp', updateSmtpSettings);
router.put('/api-keys', updateApiKeys);

export default router;
