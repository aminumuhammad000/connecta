import { Router } from 'express';
import { getSettings, updateSmtpSettings, updateApiKeys, updatePaymentSettings, updateGeneralSettings, updateSecuritySettings, getPublicContactSettings, updateContactSettings } from '../controllers/settings.controller.js';
import { authenticate } from '../core/middleware/auth.middleware.js';
import { isAdmin } from '../core/middleware/admin.middleware.js';
const router = Router();
// Public route to fetch direct contact details (for landing page, help page, footer)
router.get('/contact', getPublicContactSettings);
// Secure all remaining settings routes
router.use(authenticate);
// Admin-only for updates
router.get('/', isAdmin, getSettings);
router.put('/contact', isAdmin, updateContactSettings);
router.put('/smtp', isAdmin, updateSmtpSettings);
router.put('/api-keys', isAdmin, updateApiKeys);
router.put('/payments', isAdmin, updatePaymentSettings);
router.put('/general', isAdmin, updateGeneralSettings);
router.put('/security', isAdmin, updateSecuritySettings);
export default router;
