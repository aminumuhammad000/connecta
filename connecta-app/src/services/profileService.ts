import { get, put, post, uploadFile } from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { Profile } from '../types';
import { saveProfileData, getProfileData, saveCachedProfile, getCachedProfile } from '../utils/storage';

let hasLoggedMissingProfile = false;

const unwrapProfile = (response: any): Profile | null => {
    if (!response) return null;
    const data = response?.data ?? response;

    // Handle API envelope shapes
    if (data?.success === false) return null;
    
    // If the data is nested in a 'data' property (standard for our newer controllers)
    const profileObj = (data?.success === true && data?.data != null) ? data.data : data;

    // Treat successful responses with null data as present to avoid repeated prompts
    if (data?.success === true && profileObj === null) return {} as Profile;

    // Check for profile fields in the extracted object
    // Use stable discriminating fields that are always present in a profile response
    const finalData = profileObj;
    const hasProfileFields = finalData && (
        finalData.bio !== undefined ||
        finalData.skills !== undefined ||
        finalData.employment !== undefined ||
        finalData.portfolio !== undefined ||
        finalData.companyName !== undefined ||
        finalData.location !== undefined ||
        finalData.phoneNumber !== undefined ||
        finalData.createdAt !== undefined
    );

    if (finalData?.profile) {
        return finalData.profile as Profile;
    }

    if (hasProfileFields) {
        if (finalData.user && typeof finalData.user === 'object') {
            return {
                ...finalData.user,
                ...finalData,
                userId: finalData.user._id || finalData.user.id || finalData.userId
            } as Profile;
        }
        return finalData as Profile;
    }

    if (finalData?.user && typeof finalData.user === 'object') {
        return finalData.user as Profile;
    }

    if (finalData && typeof finalData === 'object' && Object.keys(finalData).length > 0) {
        return finalData as Profile;
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
        const profile = unwrapProfile(response);
        
        // Only save if we have actual profile data (not just an empty object)
        if (profile && Object.keys(profile).length > 2) { 
            await saveProfileData(profile);
        }
        return profile;
    } catch (error: any) {
        // Fallback to cache if error (e.g. offline)
        const cached = await getProfileData();
        if (cached) {
            console.log('[ProfileService] Using cached profile data');
            return cached;
        }

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
    try {
        const response = await get<Profile>(API_ENDPOINTS.PROFILE_BY_ID(id));
        const data = unwrapProfile(response);
        if (data && data.userId) {
            await saveCachedProfile(data.userId, data);
        }
        return data as Profile;
    } catch (error) {
        // Since we don't have userId easily from just 'id' (which is profile _id),
        // fallback might be limited unless we find it in cache by some other means.
        // But getProfileByUserId is more common.
        throw error;
    }
};

/**
 * Get profile by User ID
 */
export const getProfileByUserId = async (userId: string): Promise<Profile> => {
    try {
        const response = await get<Profile>(API_ENDPOINTS.PROFILE_BY_USER_ID(userId));
        const data = unwrapProfile(response);
        if (data) {
            await saveCachedProfile(userId, data);
        }
        return data as Profile;
    } catch (error) {
        const cached = await getCachedProfile(userId);
        if (cached) {
            console.log('[ProfileService] Using cached profile for userId:', userId);
            return cached;
        }
        throw error;
    }
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
        if (data) {
            await saveProfileData(data);
        }
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
