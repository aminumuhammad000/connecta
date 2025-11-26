import { Request, Response } from 'express';
import Notification, { NotificationType } from '../models/Notification.model';
import { getIO } from '../core/utils/socketIO';

/**
 * Get all notifications for the authenticated user
 */
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query: any = { userId };
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
  } catch (error: any) {
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
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;

    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      data: { unreadCount },
    });
  } catch (error: any) {
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
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
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
  } catch (error: any) {
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
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;

    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error: any) {
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
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
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
  } catch (error: any) {
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
export const clearReadNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;

    await Notification.deleteMany({ userId, isRead: true });

    return res.status(200).json({
      success: true,
      message: 'Read notifications cleared',
    });
  } catch (error: any) {
    console.error('Clear notifications error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to clear notifications',
    });
  }
};

/**
 * Helper function to create and send a notification
 */
export interface CreateNotificationData {
  userId: any;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: any;
  relatedType?: 'job' | 'project' | 'proposal' | 'message' | 'review' | 'payment';
  actorId?: any;
  actorName?: string;
  link?: string;
  icon?: string;
  priority?: 'low' | 'medium' | 'high';
}

export const createNotification = async (data: CreateNotificationData) => {
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
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

/**
 * Helper functions for common notification types
 */
export const notifyProposalReceived = async (
  clientId: any,
  freelancerName: string,
  jobTitle: string,
  proposalId: any
) => {
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

export const notifyProposalAccepted = async (
  freelancerId: any,
  clientName: string,
  jobTitle: string,
  projectId: any
) => {
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

export const notifyPaymentReceived = async (
  freelancerId: any,
  amount: number,
  currency: string,
  projectTitle: string
) => {
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

export const notifyReviewReceived = async (
  userId: any,
  reviewerName: string,
  rating: number,
  projectTitle: string
) => {
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
export const getAllNotifications = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    console.error('Get all notifications error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch notifications',
    });
  }
};
