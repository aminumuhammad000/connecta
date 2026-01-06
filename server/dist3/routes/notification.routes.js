"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notification_controller_1 = require("../controllers/notification.controller");
const notification_controller_2 = require("../controllers/notification.controller");
const auth_middleware_1 = require("../core/middleware/auth.middleware");
const router = express_1.default.Router();
// Admin: Get all notifications (no auth)
router.get('/admin/all', notification_controller_1.getAllNotifications);
// Get all notifications (protected)
router.get('/', auth_middleware_1.authenticate, notification_controller_2.getNotifications);
// Get unread count (protected)
router.get('/unread-count', auth_middleware_1.authenticate, notification_controller_2.getUnreadCount);
// Mark notification as read (protected)
router.patch('/:notificationId/read', auth_middleware_1.authenticate, notification_controller_2.markAsRead);
// Mark all as read (protected)
router.patch('/mark-all-read', auth_middleware_1.authenticate, notification_controller_2.markAllAsRead);
// Delete notification (protected)
router.delete('/:notificationId', auth_middleware_1.authenticate, notification_controller_2.deleteNotification);
// Clear all read notifications (protected)
router.delete('/clear-read', auth_middleware_1.authenticate, notification_controller_2.clearReadNotifications);
exports.default = router;
