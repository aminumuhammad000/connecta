import { post } from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { AuthResponse, LoginCredentials, SignupData, ApiResponse, UserType } from '../types';

/**
 * Authentication Service
 * Handles user authentication operations
 * Updated: Force Reload
 */
console.log('AuthService Module Loaded');

/**
 * Check if email exists
 */
export const checkEmailExists = async (email: string): Promise<{ success: boolean; exists: boolean }> => {
    const response = await post<{ success: boolean; exists: boolean }>('/api/users/check-email', { email });
    return response as any;
};

/**
 * Check if phone number exists
 */
export const checkPhoneExists = async (phoneNumber: string): Promise<{ success: boolean; exists: boolean }> => {
    const response = await post<{ success: boolean; exists: boolean }>('/api/users/check-phone', { phoneNumber });
    return response as any;
};

/**
 * Initiate sign up (send OTP without creating user)
 */
export const initiateSignup = async (email: string, firstName: string, preferredLanguage?: string): Promise<ApiResponse> => {
    return await post<ApiResponse>('/api/users/initiate-signup', { email, firstName, preferredLanguage });
};

/**
 * Sign up a new user (Complete)
 */
export const signup = async (data: any, autoLogin?: boolean): Promise<AuthResponse> => {
    const response = await post<AuthResponse>(API_ENDPOINTS.SIGNUP, { ...data, autoLogin });
    const authData = response.data || response;
    return authData as AuthResponse;
};

export const googleSignup = async (tokenId: string, userType: UserType): Promise<AuthResponse> => {
    const response = await post<AuthResponse>(API_ENDPOINTS.GOOGLE_SIGNUP, { tokenId, userType });
    return response.data as AuthResponse;
};

export const googleSignin = async (tokenId: string): Promise<AuthResponse> => {
    const response = await post<AuthResponse>(API_ENDPOINTS.GOOGLE_SIGNIN, { tokenId });
    return response.data as AuthResponse;
};

/**
 * Sign in an existing user
 */
export const signin = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await post<AuthResponse>(API_ENDPOINTS.SIGNIN, credentials);
    // Handle both { data: { token... } } and { token... } structures
    const authData = response.data || response;
    return authData as AuthResponse;
};





/**
 * Forgot Password - Send OTP
 */
export const sendPasswordResetOTP = async (email: string): Promise<ApiResponse> => {
    console.log('Sending Password Reset OTP (Hardcoded URL)');
    const response = await post<ApiResponse>('/api/users/forgot-password', { email });
    return response;
};

/**
 * Verify OTP
 */
export const verifyOTP = async (email: string, otp: string): Promise<any> => {
    const response = await post<any>('/api/users/verify-otp', { email, otp });
    return response;
};

export const resetPassword = async (resetToken: string, newPassword: string): Promise<ApiResponse> => {
    const response = await post<ApiResponse>('/api/users/reset-password', { resetToken, newPassword });
    return response;
};

export const verifyEmail = async (otp: string, email?: string): Promise<ApiResponse> => {
    const response = await post<ApiResponse>('/api/users/verify-email', { otp, email });
    return response;
};

export const resendVerification = async (email?: string): Promise<ApiResponse> => {
    const response = await post<ApiResponse>('/api/users/resend-verification', { email });
    return response;
};

export const updatePushToken = async (pushToken: string): Promise<ApiResponse> => {
    const response = await post<ApiResponse>('/api/users/push-token', { pushToken });
    return response;
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<ApiResponse> => {
    const response = await post<ApiResponse>('/api/users/change-password', { currentPassword, newPassword });
    return response;
};

export const updatePreferredLanguage = async (preferredLanguage: 'en' | 'ha'): Promise<ApiResponse> => {
    const response = await post<ApiResponse>('/api/users/preferred-language', { preferredLanguage });
    return response;
};

export default {
    initiateSignup,
    signup,
    signin,
    googleSignin,
    sendPasswordResetOTP,
    verifyOTP,
    resetPassword,
    verifyEmail,
    resendVerification,
    updatePushToken,
    changePassword,
    updatePreferredLanguage,
};
