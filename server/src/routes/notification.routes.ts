import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
} from '../controllers/notification.controller';
import { authenticate } from '../core/middleware/auth.middleware';

const router = express.Router();

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
