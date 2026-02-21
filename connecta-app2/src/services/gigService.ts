import { get, post } from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { Gig } from '../types';

/**
 * Gig Service
 * Handles gig-related API calls
 */

/**
 * Get matched gigs for user
 */
export const getMatchedGigs = async (): Promise<Gig[]> => {
    const response = await get<Gig[]>(API_ENDPOINTS.MATCHED_GIGS);
    return response.data!;
};

/**
 * Get saved gigs
 */
export const getSavedGigs = async (): Promise<Gig[]> => {
    const response = await get<Gig[]>(API_ENDPOINTS.SAVED_GIGS);
    return response.data!;
};

/**
 * Get gig applications
 */
export const getGigApplications = async (): Promise<any[]> => {
    const response = await get(API_ENDPOINTS.GIG_APPLICATIONS);
    return response.data!;
};

/**
 * Apply to a gig
 */
export const applyToGig = async (gigId: string): Promise<any> => {
    const response = await post(API_ENDPOINTS.APPLY_TO_GIG(gigId));
    return response.data!;
};

/**
 * Save a gig
 */
export const saveGig = async (gigId: string): Promise<any> => {
    const response = await post(API_ENDPOINTS.SAVE_GIG(gigId));
    return response.data!;
};

export default {
    getMatchedGigs,
    getSavedGigs,
    getGigApplications,
    applyToGig,
    saveGig,
};
