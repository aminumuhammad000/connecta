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
export const getOrCreateConversation = async (participantIds: string[]): Promise<Conversation> => {
    const response = await post<Conversation>(API_ENDPOINTS.CONVERSATIONS, { participants: participantIds });
    return response.data!;
};

/**
 * Get all conversations for a user
 */
export const getUserConversations = async (userId: string): Promise<Conversation[]> => {
    const response = await get<Conversation[]>(API_ENDPOINTS.USER_CONVERSATIONS(userId));
    return response.data!;
};

/**
 * Get messages for a conversation
 */
export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
    const response = await get<Message[]>(API_ENDPOINTS.CONVERSATION_MESSAGES(conversationId));
    return response.data!;
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
    receiverId: string;
    content: string;
}): Promise<Message> => {
    const response = await post<Message>(API_ENDPOINTS.SEND_MESSAGE, messageData);
    return response.data!;
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (messageIds: string[]): Promise<void> => {
    await patch(API_ENDPOINTS.MARK_READ, { messageIds });
};

export default {
    getOrCreateConversation,
    getUserConversations,
    getConversationMessages,
    getMessagesBetween,
    sendMessage,
    markMessagesAsRead,
};
