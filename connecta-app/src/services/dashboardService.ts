import { get } from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { DashboardStats, User, Message } from '../types';

/**
 * Dashboard Service
 * Handles dashboard-related API calls
 */

const unwrap = <T>(response: any, fallback: T): T => {
    if (response && typeof response === 'object' && 'data' in response) {
        const value = (response as any).data;
        return (value ?? fallback) as T;
    }
    return (response ?? fallback) as T;
};

/**
 * Get client dashboard statistics
 */
export const getClientStats = async (): Promise<DashboardStats> => {
    const response = await get<DashboardStats>(API_ENDPOINTS.DASHBOARD_STATS);
    return unwrap<DashboardStats>(response, {} as DashboardStats);
};

/**
 * Get freelancer dashboard statistics
 */
export const getFreelancerStats = async (): Promise<DashboardStats> => {
    const response = await get<DashboardStats>('/api/dashboard/freelancer/stats');
    return unwrap<DashboardStats>(response, {} as DashboardStats);
};

/**
 * Get recommended freelancers for client dashboard
 */
export const getRecommendedFreelancers = async (): Promise<User[]> => {
    const response = await get<User[]>(API_ENDPOINTS.DASHBOARD_FREELANCERS);
    return unwrap<User[]>(response, []);
};

/**
 * Get recent messages for dashboard
 */
export const getRecentMessages = async (): Promise<Message[]> => {
    const response = await get<Message[]>(API_ENDPOINTS.DASHBOARD_MESSAGES);
    return unwrap<Message[]>(response, []);
};

/**
 * Test backend connection
 */
export const testConnection = async (): Promise<{ message: string }> => {
    const response = await get<{ message: string }>('/');
    return unwrap<{ message: string }>(response, { message: 'Connection failed' });
};

export default {
    getClientStats,
    getFreelancerStats,
    getRecommendedFreelancers,
    getRecentMessages,
    testConnection,
};
