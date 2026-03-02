import { get, put, post, uploadFile } from './api';
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

    // If it's a flattened profile (our new standard) or has profile fields, return as is
    // We check for fields that only exist in a Profile, not a User
    const hasProfileFields = data && (data.bio !== undefined || data.skills !== undefined || data.employment !== undefined || data.portfolio !== undefined);

    if (data?.profile) {
        // If it's wrapped in a 'profile' key, return that
        return data.profile as Profile;
    }

    if (hasProfileFields) {
        // If the root object has profile fields, return the root object
        // Merging user data if it's nested but we are in the root
        if (data.user && typeof data.user === 'object') {
            return {
                ...data.user,
                ...data,
                userId: data.user._id || data.user.id || data.userId
            } as Profile;
        }
        return data as Profile;
    }

    if (data?.user && typeof data.user === 'object') {
        // Only return just the user if no profile fields were found at root
        return data.user as Profile;
    }

    // Fallback: return root object if it's an object
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
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

/**
 * Parse resume file
 */
export const parseResume = async (formData: FormData): Promise<any> => {
    const response = await uploadFile(`${API_ENDPOINTS.PROFILES}/parse-resume`, formData);

    // Direct unwrapping for this specific endpoint structure
    if (response?.success && response?.data) {
        return response.data;
    }

    // Fallback to standard unwrapper
    const data = unwrapProfile(response);
    return data;
};

/**
 * Download Resume PDF
 */
export const downloadResume = async (): Promise<string | null> => {
    // Return the URL for the frontend to handle download
    return `${API_ENDPOINTS.PROFILES}/me/resume/pdf`;
};

export default {
    getMyProfile,
    getProfileById,
    getProfileByUserId,
    createProfile,
    updateMyProfile,
    updateProfile,
    parseResume,
    downloadResume,
};
