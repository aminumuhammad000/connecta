import { get, post, patch } from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { Message, Conversation } from '../types';

/**
 * Message Service
 * Handles messaging and conversation API calls
 */

/**
 * Get or create a conversation
 */
export const getOrCreateConversation = async (payload: {
    participants?: string[];
    clientId?: string;
    freelancerId?: string;
    projectId?: string;
}): Promise<Conversation> => {
    const response = await post<Conversation>(API_ENDPOINTS.CONVERSATIONS, payload);
    return (response as any)?.data || response;
};

/**
 * Get all conversations for a user
 */
export const getUserConversations = async (userId: string): Promise<Conversation[]> => {
    const response = await get<Conversation[]>(API_ENDPOINTS.USER_CONVERSATIONS(userId));
    return Array.isArray(response) ? response : (response as any)?.data || [];
};

/**
 * Get messages for a conversation
 */
export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
    const response = await get<Message[]>(API_ENDPOINTS.CONVERSATION_MESSAGES(conversationId));
    return Array.isArray(response) ? response : (response as any)?.data || [];
};

/**
 * Get messages between two users
 */
export const getMessagesBetween = async (userId1: string, userId2: string): Promise<Message[]> => {
    const response = await get<Message[]>(API_ENDPOINTS.MESSAGES_BETWEEN(userId1, userId2));
    return response.data!;
};

/**
 * Send a message
 */
export const sendMessage = async (messageData: {
    conversationId: string;
    senderId: string;
    receiverId: string;
    text: string;
}): Promise<Message> => {
    const response = await post<Message>(API_ENDPOINTS.SEND_MESSAGE, messageData);
    return (response as any)?.data || response;
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (conversationId: string, userId: string): Promise<void> => {
    await patch(API_ENDPOINTS.MARK_READ, { conversationId, userId });
};

/**
 * Get total unread messages count for a user
 */
export const getTotalUnreadCount = async (userId: string): Promise<number> => {
    const response = await get<{ unreadCount: number }>(API_ENDPOINTS.UNREAD_COUNT_TOTAL(userId));
    return (response as any)?.data?.unreadCount || 0;
};

export default {
    getOrCreateConversation,
    getUserConversations,
    getConversationMessages,
    getMessagesBetween,
    sendMessage,
    markMessagesAsRead,
    getTotalUnreadCount,
};
