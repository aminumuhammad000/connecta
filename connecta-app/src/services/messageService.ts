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
    participants: string[];
    metadata?: any;
}): Promise<Conversation> => {
    const response = await post<Conversation>(API_ENDPOINTS.CONVERSATIONS, payload);
    return (response as any)?.data || response;
};

/**
 * Get all conversations for the current user
 */
export const getUserConversations = async (): Promise<Conversation[]> => {
    const response = await get<Conversation[]>(API_ENDPOINTS.CONVERSATIONS);
    return Array.isArray(response) ? response : (response as any)?.data || [];
};
 
/**
 * Get single conversation details
 */
export const getConversationById = async (conversationId: string): Promise<Conversation> => {
    const response = await get<Conversation>(API_ENDPOINTS.CONVERSATION_DETAILS(conversationId));
    return (response as any)?.data || response;
};

/**
 * Get messages and details for a conversation
 */
export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
    const response = await get<any>(API_ENDPOINTS.CONVERSATION_MESSAGES(conversationId));
    // Handle both wrapped and unwrapped (by api.ts interceptor) responses
    if (Array.isArray(response)) return response;
    return response?.data || response?.messages || [];
};

/**
 * Send a message
 */
export const sendMessage = async (messageData: {
    conversationId: string;
    text: string;
    senderId?: string;
    receiverId?: string;
    messageType?: string;
    attachments?: string[];
}): Promise<Message> => {
    const response = await post<Message>(API_ENDPOINTS.SEND_MESSAGE, messageData);
    return (response as any)?.data || response;
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (conversationId: string): Promise<void> => {
    await patch(API_ENDPOINTS.MARK_READ, { conversationId });
};

/**
 * Get total unread messages count for the current user
 */
export const getTotalUnreadCount = async (): Promise<number> => {
    const response = await get<any>(API_ENDPOINTS.UNREAD_COUNT_TOTAL);
    // Handle both wrapped and unwrapped (by api.ts interceptor) responses
    return response?.unreadCount !== undefined ? response.unreadCount : (response as any)?.data?.unreadCount || 0;
};

export default {
    getOrCreateConversation,
    getUserConversations,
    getConversationById,
    getConversationMessages,
    sendMessage,
    markMessagesAsRead,
    getTotalUnreadCount,
};
