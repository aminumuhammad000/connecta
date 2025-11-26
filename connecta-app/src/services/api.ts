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
            console.log('🔵 API Request:', config.method?.toUpperCase(), (config.baseURL || '') + (config.url || ''));
            const token = await getToken();
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
        return response.data;
    },
    (error: AxiosError<ApiResponse>) => {
        // Handle different error scenarios
        const apiError: ApiError = {
            message: 'An unexpected error occurred',
            status: error.response?.status,
        };

        if (error.response) {
            // Server responded with error status
            const serverMessage = error.response.data?.message || error.response.data?.error;
            apiError.status = error.response.status;

            // Use server message if available, otherwise use generic message based on status
            if (serverMessage) {
                apiError.message = serverMessage;
            } else if (error.response.status === 401) {
                apiError.message = 'Session expired. Please login again.';
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
        }

        console.error('API Error:', apiError);
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

/**
 * Upload file with multipart/form-data
 */
export const uploadFile = async (url: string, formData: FormData): Promise<ApiResponse> => {
    return apiClient.post(url, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export default apiClient;
