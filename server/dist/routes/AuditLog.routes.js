import { Router } from 'express';
import { getAllAuditLogs, getAuditLogStats, deleteAuditLogs, } from '../controllers/AuditLog.controller.js';
import { isAdmin } from '../core/middleware/admin.middleware.js';
const router = Router();
// All audit log routes require admin access
router.use(isAdmin);
// Get all audit logs
router.get('/', getAllAuditLogs);
// Get audit log statistics
router.get('/stats', getAuditLogStats);
// Delete audit logs (cleanup)
router.delete('/', deleteAuditLogs);
export default router;
