import { get, post, put } from './api';
import { API_ENDPOINTS } from '../utils/constants';

import { User } from '../types';

/**
 * User Service
 * Handles user-related API calls
 */

/**
 * Get current user info
 */
export const getMe = async (): Promise<User> => {
    try {
        const response = await get<User>('/api/users/me');
        const data = (response as any)?.data ?? response;
        return data as User;
    } catch (error: any) {
        throw error;
    }
};

/**
 * Update current user info
 */
export const updateMe = async (userData: Partial<User>): Promise<User> => {
    try {
        const response = await put<User>('/api/users/me', userData);
        const data = (response as any)?.data ?? response;
        return data as User;
    } catch (error: any) {
        throw error;
    }
};

/**
 * Get user by ID
 */
export const getUserById = async (id: string): Promise<User> => {
    const response = await get<User>(API_ENDPOINTS.USER_BY_ID(id));
    const data = (response as any)?.data ?? response;
    return data as User;
};

/**
 * Claim daily reward
 */
export const claimDailyReward = async (): Promise<any> => {
    try {
        const response = await post<any>(API_ENDPOINTS.CLAIM_REWARD, {});
        return response;
    } catch (error: any) {
        throw error;
    }
};

/**
 * Get spark history
 */
export const getSparkHistory = async (page = 1, limit = 20): Promise<any> => {
    try {
        const response = await get<any>(`${API_ENDPOINTS.SPARK_HISTORY}?page=${page}&limit=${limit}`);
        return response;
    } catch (error: any) {
        throw error;
    }
};

/**
 * Get spark stats
 */
export const getSparkStats = async (): Promise<any> => {
    try {
        const response = await get<any>(API_ENDPOINTS.SPARK_STATS);
        return response;
    } catch (error: any) {
        throw error;
    }
};

export default {
    getMe,
    updateMe,
    getUserById,
    claimDailyReward,
    getSparkHistory,
    getSparkStats,
};
