import { post } from './api';
import { API_ENDPOINTS } from '../utils/constants';

interface AgentResponse {
    success: boolean;
    result: {
        success: boolean;
        data: string;
        metadata?: any;
    };
}

export const sendMessageToAgent = async (input: string, userId: string, userType?: string): Promise<AgentResponse> => {
    const response = await post<AgentResponse>(API_ENDPOINTS.AI_AGENT, {
        input,
        userId,
        userType
    });
    return response as unknown as AgentResponse;
};

export default {
    sendMessageToAgent,
};
