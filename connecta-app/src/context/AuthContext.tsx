import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, UserType, LoginCredentials, SignupData } from '../types';
import * as authService from '../services/authService';
import * as storage from '../utils/storage';

interface AuthContextValue {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<any>;
    loginWithToken: (token: string, user: User) => Promise<void>;
    signup: (data: SignupData, autoLogin?: boolean) => Promise<any>;
    googleLogin: (tokenId: string) => Promise<User>;
    googleSignup: (tokenId: string, userType: UserType, autoLogin?: boolean) => Promise<any>;
    logout: () => Promise<void>;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        checkAuthStatus();

        // Register logout handler for API 401s
        const { registerLogoutHandler } = require('../services/api');
        registerLogoutHandler(async () => {
            await logout();
        });
    }, []);

    const checkAuthStatus = async () => {
        try {
            const [savedToken, savedUser] = await Promise.all([
                storage.getToken(),
                storage.getUserData(),
            ]);

            if (savedToken && savedUser) {
                setToken(savedToken);
                setUser(savedUser);
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (credentials: LoginCredentials) => {
        console.log('🔑 [AuthContext] Login function called');
        console.log('📧 [AuthContext] Email:', credentials.email);

        try {
            console.log('🌐 [AuthContext] Calling authService.signin...');
            const response = await authService.signin(credentials);
            console.log('✅ [AuthContext] authService.signin response:', JSON.stringify(response, null, 2));

            // Handle potential nested response structure
            const token = response.token || (response as any).data?.token;
            const user = response.user || (response as any).data?.user;

            console.log('🔍 [AuthContext] Extracted token:', token ? '✅ Present' : '❌ Missing');
            console.log('🔍 [AuthContext] Extracted user:', user ? `✅ ${user.email}` : '❌ Missing');

            if (token && user) {
                console.log('💾 [AuthContext] Saving to storage...');
                // Save token and user data
                await storage.saveToken(token);
                console.log('✅ [AuthContext] Token saved');
                await storage.saveUserData(user);
                console.log('✅ [AuthContext] User data saved');
                await storage.saveUserRole(user.userType);
                console.log('✅ [AuthContext] User role saved:', user.userType);

                console.log('🔄 [AuthContext] Updating state...');
                setToken(token);
                setUser(user);
                console.log('✅ [AuthContext] Login complete! User:', user.email);
                return user;
            } else {
                console.error('❌ [AuthContext] Login response missing token/user:', response);
                throw new Error('Login failed: Invalid response from server');
            }
        } catch (error) {
            console.error('❌ [AuthContext] Login error:', error);
            console.error('❌ [AuthContext] Error details:', JSON.stringify(error, null, 2));
            throw error;
        }
    };

    const signup = async (data: SignupData, autoLogin = true) => {
        try {
            const response = await authService.signup(data);

            if (autoLogin) {
                // Handle potential nested response structure
                const token = response.token || (response as any).data?.token;
                const user = response.user || (response as any).data?.user;

                if (token && user) {
                    // Save token and user data
                    await storage.saveToken(token);
                    await storage.saveUserData(user);
                    await storage.saveUserRole(user.userType);

                    setToken(token);
                    setUser(user);
                } else {
                    console.warn('Signup successful but token/user missing in response:', response);
                }
            }
            return response;
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    };

    const googleSignup = async (tokenId: string, userType: UserType, autoLogin = true) => {
        try {
            const response = await authService.googleSignup(tokenId, userType);

            if (autoLogin) {
                await storage.saveToken(response.token);
                await storage.saveUserData(response.user);
                await storage.saveUserRole(response.user.userType);
                setToken(response.token);
                setUser(response.user);
            }
            return response;
        } catch (error) {
            console.error('Google signup error:', error);
            throw error;
        }
    };

    const googleLogin = async (tokenId: string) => {
        try {
            const response = await authService.googleSignin(tokenId);
            await storage.saveToken(response.token);
            await storage.saveUserData(response.user);
            await storage.saveUserRole(response.user.userType);
            setToken(response.token);
            setUser(response.user);
            return response.user; // Return user for navigation
        } catch (error) {
            console.error('Google login error:', error);
            throw error;
        }
    };

    const loginWithToken = async (token: string, user: User) => {
        try {
            await storage.saveToken(token);
            await storage.saveUserData(user);
            await storage.saveUserRole(user.userType);
            setToken(token);
            setUser(user);
        } catch (error) {
            console.error('Login with token error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            // Clear all stored data
            await storage.clearAllData();

            setToken(null);
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        storage.saveUserData(updatedUser);
    };

    const value = useMemo(
        () => ({
            user,
            token,
            isAuthenticated: !!token && !!user,
            isLoading,
            login,
            loginWithToken,
            signup,
            googleLogin,
            googleSignup,
            logout,
            updateUser,
        }),
        [user, token, isLoading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
