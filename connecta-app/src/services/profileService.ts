import { get, put, post } from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { Profile } from '../types';

let hasLoggedMissingProfile = false;

const unwrapProfile = (response: any): Profile | null => {
    if (!response) return null;
    const data = response?.data ?? response;

    // Handle API envelope shapes
    if (data?.success === false) return null;
    // Treat successful responses with null data as present to avoid repeated prompts
    if (data?.success === true && data?.data === null) return {} as Profile;
    if (data?.profile) return data.profile as Profile;
    if (data?.user) return data.user as Profile;

    // If we have any non-null object/array here, return it so the app treats profile as present
    if (data && typeof data === 'object') {
        return data as Profile;
    }

    return null;
};

/**
 * Profile Service
 * Handles profile-related API calls
 */

/**
 * Get current user's profile
 */
export const getMyProfile = async (): Promise<Profile | null> => {
    try {
        const response = await get<Profile>(API_ENDPOINTS.PROFILE_ME);
        return unwrapProfile(response);
    } catch (error: any) {
        if (error?.status === 404) {
            return null;
        }
        throw error;
    }
};

/**
 * Get profile by ID
 */
export const getProfileById = async (id: string): Promise<Profile> => {
    const response = await get<Profile>(API_ENDPOINTS.PROFILE_BY_ID(id));
    const data = unwrapProfile(response);
    return data as Profile;
};

/**
 * Get profile by User ID
 */
export const getProfileByUserId = async (userId: string): Promise<Profile> => {
    const response = await get<Profile>(API_ENDPOINTS.PROFILE_BY_USER_ID(userId));
    const data = unwrapProfile(response);
    return data as Profile;
};

/**
 * Create new profile
 */
export const createProfile = async (profileData: Partial<Profile>): Promise<Profile> => {
    const response = await post<Profile>(API_ENDPOINTS.PROFILES, profileData);
    const data = unwrapProfile(response);
    return data as Profile;
};

/**
 * Update current user's profile
 */
export const updateMyProfile = async (profileData: Partial<Profile>): Promise<Profile> => {
    try {
        const response = await put<Profile>(API_ENDPOINTS.PROFILE_ME, profileData);
        const data = unwrapProfile(response);
        return data as Profile;
    } catch (error: any) {
        // If profile doesn't exist yet, create it with the provided data
        if (error?.status === 404) {
            const created = await createProfile(profileData);
            return created;
        }
        throw error;
    }
};

/**
 * Update profile by ID
 */
export const updateProfile = async (id: string, profileData: Partial<Profile>): Promise<Profile> => {
    const response = await put<Profile>(API_ENDPOINTS.PROFILE_BY_ID(id), profileData);
    const data = (response as any)?.data ?? response;
    return data as Profile;
};

export default {
    getMyProfile,
    getProfileById,
    getProfileByUserId,
    createProfile,
    updateMyProfile,
    updateProfile,
};
