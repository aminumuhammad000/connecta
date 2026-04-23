import { get, put } from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Settings Service
 * Handles system settings API calls
 */

export const getSystemSettings = async (): Promise<any> => {
    const response = await get(API_ENDPOINTS.SETTINGS);
    return response;
};

export const updatePaymentSettings = async (data: { jobPostingFee: number }): Promise<any> => {
    return await put(`${API_ENDPOINTS.SETTINGS}/payments`, data);
};

export default {
    getSystemSettings,
    updatePaymentSettings,
};
