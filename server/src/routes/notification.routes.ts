import express from 'express';
import { getAllNotifications } from '../controllers/notification.controller.js';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
  testWhatsAppNotification
} from '../controllers/notification.controller.js';
import { authenticate } from '../core/middleware/auth.middleware.js';

const router = express.Router();
// Admin: Get all notifications (no auth)
router.get('/admin/all', getAllNotifications);

// Test WhatsApp (Admin/Public for testing)
router.post('/test-whatsapp', testWhatsAppNotification);

// Get all notifications (protected)
router.get('/', authenticate, getNotifications);

// Get unread count (protected)
router.get('/unread-count', authenticate, getUnreadCount);

// Mark notification as read (protected)
router.patch('/:notificationId/read', authenticate, markAsRead);

// Mark all as read (protected)
router.patch('/mark-all-read', authenticate, markAllAsRead);

// Delete notification (protected)
router.delete('/:notificationId', authenticate, deleteNotification);

// Clear all read notifications (protected)
router.delete('/clear-read', authenticate, clearReadNotifications);

export default router;
