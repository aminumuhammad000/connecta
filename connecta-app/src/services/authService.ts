import { post } from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { AuthResponse, LoginCredentials, SignupData, ApiResponse } from '../types';

/**
 * Authentication Service
 * Handles user authentication operations
 */

/**
 * Sign up a new user
 */
export const signup = async (data: SignupData): Promise<AuthResponse> => {
    const response = await post<AuthResponse>(API_ENDPOINTS.SIGNUP, data);
    return response as AuthResponse;
};

/**
 * Sign in an existing user
 */
export const signin = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await post<AuthResponse>(API_ENDPOINTS.SIGNIN, credentials);
    return response as AuthResponse;
};

/**
 * Sign up with Google
 */
export const googleSignup = async (googleToken: string, userType: 'client' | 'freelancer'): Promise<AuthResponse> => {
    const response = await post<AuthResponse>(API_ENDPOINTS.GOOGLE_SIGNUP, {
        token: googleToken,
        userType,
    });
    return response as AuthResponse;
};

/**
 * Sign in with Google
 */
export const googleSignin = async (googleToken: string): Promise<AuthResponse> => {
    const response = await post<AuthResponse>(API_ENDPOINTS.GOOGLE_SIGNIN, {
        token: googleToken,
    });
    return response as AuthResponse;
};

export default {
    signup,
    signin,
    googleSignup,
    googleSignin,
};
