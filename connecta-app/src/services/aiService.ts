import { post } from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * AI Agent Service
 * Handles AI agent-related API calls
 */

/**
 * Send a query to the AI agent
 */
export const sendAIQuery = async (input: string, userId: string, userType: 'client' | 'freelancer'): Promise<string> => {
    const response = await post<{ response: string }>(API_ENDPOINTS.AI_AGENT, {
        input,
        userId,
        userType,
    });
    return response.data?.response || '';
};

export default {
    sendAIQuery,
};
