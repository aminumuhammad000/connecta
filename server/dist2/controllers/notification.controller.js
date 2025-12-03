"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllNotifications = exports.notifyReviewReceived = exports.notifyPaymentReceived = exports.notifyProposalAccepted = exports.notifyProposalReceived = exports.createNotification = exports.clearReadNotifications = exports.deleteNotification = exports.markAllAsRead = exports.markAsRead = exports.getUnreadCount = exports.getNotifications = void 0;
const Notification_model_1 = __importDefault(require("../models/Notification.model"));
const socketIO_1 = require("../core/utils/socketIO");
/**
 * Get all notifications for the authenticated user
 */
const getNotifications = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.user?.userId;
        const { page = 1, limit = 20, unreadOnly = false } = req.query;
        const query = { userId };
        if (unreadOnly === 'true') {
            query.isRead = false;
        }
        const notifications = await Notification_model_1.default.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const total = await Notification_model_1.default.countDocuments(query);
        const unreadCount = await Notification_model_1.default.countDocuments({ userId, isRead: false });
        return res.status(200).json({
            success: true,
            data: notifications,
            unreadCount,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error('Get notifications error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch notifications',
        });
    }
};
exports.getNotifications = getNotifications;
/**
 * Get unread count
 */
const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.user?.userId;
        const unreadCount = await Notification_model_1.default.countDocuments({
            userId,
            isRead: false,
        });
        return res.status(200).json({
            success: true,
            data: { unreadCount },
        });
    }
    catch (error) {
        console.error('Get unread count error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch unread count',
        });
    }
};
exports.getUnreadCount = getUnreadCount;
/**
 * Mark notification as read
 */
const markAsRead = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.user?.userId;
        const { notificationId } = req.params;
        const notification = await Notification_model_1.default.findOne({
            _id: notificationId,
            userId,
        });
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            });
        }
        if (!notification.isRead) {
            notification.isRead = true;
            notification.readAt = new Date();
            await notification.save();
        }
        return res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            data: notification,
        });
    }
    catch (error) {
        console.error('Mark as read error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to mark notification as read',
        });
    }
};
exports.markAsRead = markAsRead;
/**
 * Mark all notifications as read
 */
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.user?.userId;
        await Notification_model_1.default.updateMany({ userId, isRead: false }, { isRead: true, readAt: new Date() });
        return res.status(200).json({
            success: true,
            message: 'All notifications marked as read',
        });
    }
    catch (error) {
        console.error('Mark all as read error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to mark all notifications as read',
        });
    }
};
exports.markAllAsRead = markAllAsRead;
/**
 * Delete a notification
 */
const deleteNotification = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.user?.userId;
        const { notificationId } = req.params;
        const notification = await Notification_model_1.default.findOneAndDelete({
            _id: notificationId,
            userId,
        });
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Notification deleted',
        });
    }
    catch (error) {
        console.error('Delete notification error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete notification',
        });
    }
};
exports.deleteNotification = deleteNotification;
/**
 * Delete all read notifications
 */
const clearReadNotifications = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.user?.userId;
        await Notification_model_1.default.deleteMany({ userId, isRead: true });
        return res.status(200).json({
            success: true,
            message: 'Read notifications cleared',
        });
    }
    catch (error) {
        console.error('Clear notifications error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to clear notifications',
        });
    }
};
exports.clearReadNotifications = clearReadNotifications;
const createNotification = async (data) => {
    try {
        const notification = await Notification_model_1.default.create(data);
        // Emit real-time notification via Socket.IO
        const io = (0, socketIO_1.getIO)();
        if (io) {
            io.to(data.userId.toString()).emit('notification', {
                _id: notification._id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                link: notification.link,
                icon: notification.icon,
                priority: notification.priority,
                createdAt: notification.createdAt,
            });
        }
        return notification;
    }
    catch (error) {
        console.error('Create notification error:', error);
        throw error;
    }
};
exports.createNotification = createNotification;
/**
 * Helper functions for common notification types
 */
const notifyProposalReceived = async (clientId, freelancerName, jobTitle, proposalId) => {
    return (0, exports.createNotification)({
        userId: clientId,
        type: 'proposal_received',
        title: 'New Proposal Received',
        message: `${freelancerName} submitted a proposal for "${jobTitle}"`,
        relatedId: proposalId,
        relatedType: 'proposal',
        actorName: freelancerName,
        link: `/client/projects`,
        icon: 'mdi:file-document',
        priority: 'high',
    });
};
exports.notifyProposalReceived = notifyProposalReceived;
const notifyProposalAccepted = async (freelancerId, clientName, jobTitle, projectId) => {
    return (0, exports.createNotification)({
        userId: freelancerId,
        type: 'proposal_accepted',
        title: '🎉 Proposal Accepted!',
        message: `${clientName} accepted your proposal for "${jobTitle}"`,
        relatedId: projectId,
        relatedType: 'project',
        actorName: clientName,
        link: `/freelancer/projects/${projectId}`,
        icon: 'mdi:check-circle',
        priority: 'high',
    });
};
exports.notifyProposalAccepted = notifyProposalAccepted;
const notifyPaymentReceived = async (freelancerId, amount, currency, projectTitle) => {
    return (0, exports.createNotification)({
        userId: freelancerId,
        type: 'payment_received',
        title: '💰 Payment Received',
        message: `You received ${currency}${amount.toLocaleString()} for "${projectTitle}"`,
        relatedType: 'payment',
        link: `/freelancer/wallet`,
        icon: 'mdi:cash',
        priority: 'high',
    });
};
exports.notifyPaymentReceived = notifyPaymentReceived;
const notifyReviewReceived = async (userId, reviewerName, rating, projectTitle) => {
    return (0, exports.createNotification)({
        userId,
        type: 'review_received',
        title: '⭐ New Review',
        message: `${reviewerName} left you a ${rating}-star review for "${projectTitle}"`,
        relatedType: 'review',
        actorName: reviewerName,
        link: `/profile`,
        icon: 'mdi:star',
        priority: 'medium',
    });
};
exports.notifyReviewReceived = notifyReviewReceived;
/**
 * Get all notifications for admin (no auth required)
 */
const getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification_model_1.default.find()
            .populate('userId', 'firstName lastName email profileImage')
            .sort({ createdAt: -1 })
            .limit(100);
        return res.status(200).json({
            success: true,
            data: notifications,
            count: notifications.length,
        });
    }
    catch (error) {
        console.error('Get all notifications error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch notifications',
        });
    }
};
exports.getAllNotifications = getAllNotifications;
