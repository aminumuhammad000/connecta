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
 * Sign up a new user
 */
export const signup = async (data: SignupData): Promise<AuthResponse> => {
    const response = await post<AuthResponse>(API_ENDPOINTS.SIGNUP, data);
    return response;
};

export const googleSignup = async (tokenId: string, userType: UserType): Promise<AuthResponse> => {
    const response = await post<AuthResponse>(API_ENDPOINTS.GOOGLE_SIGNUP, { tokenId, userType });
    return response;
};

export const googleSignin = async (tokenId: string): Promise<AuthResponse> => {
    const response = await post<AuthResponse>(API_ENDPOINTS.GOOGLE_SIGNIN, { tokenId });
    return response;
};

/**
 * Sign in an existing user
 */
export const signin = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await post<AuthResponse>(API_ENDPOINTS.SIGNIN, credentials);
    return response as AuthResponse;
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

export const verifyEmail = async (otp: string): Promise<ApiResponse> => {
    const response = await post<ApiResponse>('/api/users/verify-email', { otp });
    return response;
};

export const resendVerification = async (): Promise<ApiResponse> => {
    const response = await post<ApiResponse>('/api/users/resend-verification', {});
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

export default {
    signup,
    signin,
    googleSignin,
    sendPasswordResetOTP,
    verifyOTP,
    resetPassword,
    verifyEmail,
    resendVerification,
    updatePushToken,
};
