import { get, patch, del } from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { Notification } from '../types';

/**
 * Notification Service
 * Handles notification-related API calls
 */

/**
 * Get all notifications
 */
export const getNotifications = async (): Promise<Notification[]> => {
    const response = await get<Notification[]>(API_ENDPOINTS.NOTIFICATIONS);
    return Array.isArray(response) ? response : (response as any)?.data || [];
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (): Promise<number> => {
    const response = await get<{ count: number }>(API_ENDPOINTS.UNREAD_COUNT);
    return response.data?.count || 0;
};

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId: string): Promise<void> => {
    await patch(API_ENDPOINTS.MARK_NOTIFICATION_READ(notificationId));
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (): Promise<void> => {
    await patch(API_ENDPOINTS.MARK_ALL_READ);
};

/**
 * Delete notification
 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
    await del(API_ENDPOINTS.NOTIFICATIONS + `/${notificationId}`);
};

/**
 * Clear all read notifications
 */
export const clearReadNotifications = async (): Promise<void> => {
    await del(API_ENDPOINTS.NOTIFICATIONS + '/clear-read');
};

export default {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
};
