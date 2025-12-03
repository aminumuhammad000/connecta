import { get, put } from './api';
import { API_ENDPOINTS } from '../utils/constants';

export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    userType: 'client' | 'freelancer';
    profileImage?: string;
    createdAt?: string;
    updatedAt?: string;
}

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

export default {
    getMe,
    updateMe,
    getUserById,
};
