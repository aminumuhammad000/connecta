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
    const response = await post<any>(API_ENDPOINTS.AI_AGENT, {
        input,
        userId,
        userType,
    });

    // The agent returns { success: true, result: { message: "...", data: "...", ... } }
    // We want the text content, which is usually in result.message or result.data
    const result = response.result;
    if (!result) return '';

    // If it's a direct text response
    if (result.message && !result.toolUsed) {
        return result.message;
    }

    // If a tool was used, the result might be in data
    if (result.data && typeof result.data === 'string') {
        return result.data;
    }

    return result.message || '';
};

export default {
    sendAIQuery,
};
