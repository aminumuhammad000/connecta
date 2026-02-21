import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, DEFAULT_TIMEOUT } from '../utils/constants';
import { getToken } from '../utils/storage';
import { ApiResponse, ApiError } from '../types';

/**
 * Axios instance configured for the Connecta API
 */
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: DEFAULT_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Request interceptor to add authentication token
 */
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            const token = await getToken();
            console.log(`🔵 [API] ${config.method?.toUpperCase()} ${config.url} | Token: ${token ? '✅ (Present)' : '❌ (MISSING)'}`);
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error adding auth token to request:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response interceptor for error handling
 */
apiClient.interceptors.response.use(
    (response) => {
        // Return the data directly for successful responses
        console.log('✅ API Response:', response.config.method?.toUpperCase(), response.status, (response.config.baseURL || '') + (response.config.url || ''));
        // Handle both direct data and wrapped responses
        return response.data?.data !== undefined ? response.data : response.data;
    },
    (error: AxiosError<ApiResponse>) => {
        // Handle different error scenarios
        const apiError: ApiError = {
            message: 'An unexpected error occurred',
            status: error.response?.status,
        };

        if (error.response) {
            // Server responded with error status
            console.error(`❌ [API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} | Status: ${error.response.status} | Data:`, error.response.data);
            const serverMessage = error.response.data?.message || error.response.data?.error;
            apiError.status = error.response.status;

            // Use server message if available, otherwise use generic message based on status
            if (serverMessage) {
                apiError.message = serverMessage;
                // If the user is not found (database was cleared or user deleted), log out
                if (error.response.status === 404 && (serverMessage.includes('User not found') || serverMessage.includes('Profile not found'))) {
                    if (logoutHandler) logoutHandler();
                }
            } else if (error.response.status === 401) {
                apiError.message = 'Session expired. Please login again.';
                if (logoutHandler) logoutHandler();
            } else if (error.response.status === 403) {
                apiError.message = 'You do not have permission to perform this action.';
            } else if (error.response.status === 404) {
                apiError.message = 'The requested resource was not found.';
            } else if (error.response.status === 500) {
                apiError.message = 'Server error. Please try again later.';
            }
        } else if (error.request) {
            // Request made but no response received
            apiError.message = 'Network error. Please check your connection.';
        } else if (error.code === 'ECONNABORTED') {
            apiError.message = 'Request timeout. Please try again.';
        }

        const isProfile404 = apiError.status === 404 && (error.config?.url || '').includes('/profiles/me');
        if (!isProfile404) {
            console.error('❌ API Error:', apiError.message, '|', error.config?.url);
        }
        return Promise.reject(apiError);
    }
);

/**
 * Generic GET request
 */
export const get = async <T = any>(url: string, params?: any): Promise<ApiResponse<T>> => {
    return apiClient.get(url, { params });
};

/**
 * Generic POST request
 */
export const post = async <T = any>(url: string, data?: any): Promise<ApiResponse<T>> => {
    return apiClient.post(url, data);
};

/**
 * Generic PUT request
 */
export const put = async <T = any>(url: string, data?: any): Promise<ApiResponse<T>> => {
    return apiClient.put(url, data);
};

/**
 * Generic PATCH request
 */
export const patch = async <T = any>(url: string, data?: any): Promise<ApiResponse<T>> => {
    return apiClient.patch(url, data);
};

/**
 * Generic DELETE request
 */
export const del = async <T = any>(url: string): Promise<ApiResponse<T>> => {
    return apiClient.delete(url);
};

import { Platform } from 'react-native';

/**
 * Upload file with multipart/form-data
 */
export const uploadFile = async (url: string, formData: FormData): Promise<ApiResponse> => {
    const token = await getToken();

    return await apiClient.post(url, formData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60s timeout for uploads
    });
};

/**
 * Upload file with multipart/form-data (Public version)
 * Uses a direct axios call to bypass the interceptor entirely
 */
export const uploadFilePublic = async (url: string, formData: FormData): Promise<ApiResponse> => {
    const fullUrl = `${API_BASE_URL}${url}`;
    console.log('📡 [uploadFilePublic] Sending to:', fullUrl);

    const response = await axios.post(fullUrl, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60s timeout for uploads
    });

    return response.data;
};

// Event for handling 401 Unauthorized
let logoutHandler: (() => void) | null = null;

export const registerLogoutHandler = (handler: () => void) => {
    logoutHandler = handler;
};

export default apiClient;
