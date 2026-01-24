import Notification from '../models/Notification.model';
import { getIO } from '../core/utils/socketIO';
/**
 * Get all notifications for the authenticated user
 */
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.user?.userId;
        const { page = 1, limit = 20, unreadOnly = false } = req.query;
        const query = { userId };
        if (unreadOnly === 'true') {
            query.isRead = false;
        }
        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({ userId, isRead: false });
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
/**
 * Get unread count
 */
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.user?.userId;
        const unreadCount = await Notification.countDocuments({
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
/**
 * Mark notification as read
 */
export const markAsRead = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.user?.userId;
        const { notificationId } = req.params;
        const notification = await Notification.findOne({
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
/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.user?.userId;
        await Notification.updateMany({ userId, isRead: false }, { isRead: true, readAt: new Date() });
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
/**
 * Delete a notification
 */
export const deleteNotification = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.user?.userId;
        const { notificationId } = req.params;
        const notification = await Notification.findOneAndDelete({
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
/**
 * Delete all read notifications
 */
export const clearReadNotifications = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.user?.userId;
        await Notification.deleteMany({ userId, isRead: true });
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
export const createNotification = async (data) => {
    try {
        const notification = await Notification.create(data);
        // Emit real-time notification via Socket.IO
        const io = getIO();
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
/**
 * Helper functions for common notification types
 */
export const notifyProposalReceived = async (clientId, freelancerName, jobTitle, proposalId) => {
    return createNotification({
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
export const notifyProposalAccepted = async (freelancerId, clientName, jobTitle, projectId) => {
    return createNotification({
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
export const notifyPaymentReceived = async (freelancerId, amount, currency, projectTitle) => {
    return createNotification({
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
export const notifyReviewReceived = async (userId, reviewerName, rating, projectTitle) => {
    return createNotification({
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
/**
 * Get all notifications for admin (no auth required)
 */
export const getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find()
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
/**
 * Test WhatsApp Notification manually
 */
export const testWhatsAppNotification = async (req, res) => {
    try {
        const { phone, message } = req.body;
        if (!phone) {
            return res.status(400).json({ success: false, message: 'Phone number is required' });
        }
        const TwilioService = require('../services/twilio.service').default;
        const result = await TwilioService.sendWhatsAppMessage(phone, message || 'Hello from Connecta via Twilio Sandbox!');
        if (result && result.sid) {
            res.status(200).json({ success: true, message: 'WhatsApp sent', sid: result.sid });
        }
        else {
            res.status(500).json({ success: false, message: 'Failed to send WhatsApp (Check logs)' });
        }
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
