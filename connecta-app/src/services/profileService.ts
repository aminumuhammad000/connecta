import { get, put, post } from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { Profile } from '../types';

/**
 * Profile Service
 * Handles profile-related API calls
 */

/**
 * Get current user's profile
 */
export const getMyProfile = async (): Promise<Profile> => {
    const response = await get<Profile>(API_ENDPOINTS.PROFILE_ME);
    return response as unknown as Profile;
};

/**
 * Get profile by ID
 */
export const getProfileById = async (id: string): Promise<Profile> => {
    const response = await get<Profile>(API_ENDPOINTS.PROFILE_BY_ID(id));
    return response as unknown as Profile;
};

/**
 * Create new profile
 */
export const createProfile = async (profileData: Partial<Profile>): Promise<Profile> => {
    const response = await post<Profile>(API_ENDPOINTS.PROFILES, profileData);
    return response as unknown as Profile;
};

/**
 * Update current user's profile
 */
export const updateMyProfile = async (profileData: Partial<Profile>): Promise<Profile> => {
    const response = await put<Profile>(API_ENDPOINTS.PROFILE_ME, profileData);
    return response as unknown as Profile;
};

/**
 * Update profile by ID
 */
export const updateProfile = async (id: string, profileData: Partial<Profile>): Promise<Profile> => {
    const response = await put<Profile>(API_ENDPOINTS.PROFILE_BY_ID(id), profileData);
    return response as unknown as Profile;
};

export default {
    getMyProfile,
    getProfileById,
    createProfile,
    updateMyProfile,
    updateProfile,
};
