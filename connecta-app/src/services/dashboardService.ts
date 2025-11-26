import { get } from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { DashboardStats, User, Message } from '../types';

/**
 * Dashboard Service
 * Handles dashboard-related API calls
 */

/**
 * Get client dashboard statistics
 */
export const getClientStats = async (): Promise<DashboardStats> => {
    const response = await get<DashboardStats>(API_ENDPOINTS.DASHBOARD_STATS);
    return response.data!;
};

/**
 * Get recommended freelancers for client dashboard
 */
export const getRecommendedFreelancers = async (): Promise<User[]> => {
    const response = await get<User[]>(API_ENDPOINTS.DASHBOARD_FREELANCERS);
    return response.data!;
};

/**
 * Get recent messages for dashboard
 */
export const getRecentMessages = async (): Promise<Message[]> => {
    const response = await get<Message[]>(API_ENDPOINTS.DASHBOARD_MESSAGES);
    return response.data!;
};

export default {
    getClientStats,
    getRecommendedFreelancers,
    getRecentMessages,
};
