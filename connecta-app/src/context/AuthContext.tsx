import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, UserType, LoginCredentials, SignupData } from '../types';
import * as authService from '../services/authService';
import * as storage from '../utils/storage';

interface AuthContextValue {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    loginWithToken: (token: string, user: User) => Promise<void>;
    signup: (data: SignupData) => Promise<void>;
    googleLogin: (tokenId: string) => Promise<void>;
    googleSignup: (tokenId: string, userType: UserType) => Promise<void>;
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
        try {
            const response = await authService.signin(credentials);

            // Save token and user data
            await storage.saveToken(response.token);
            await storage.saveUserData(response.user);
            await storage.saveUserRole(response.user.userType);

            setToken(response.token);
            setUser(response.user);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const signup = async (data: SignupData) => {
        try {
            const response = await authService.signup(data);

            // Save token and user data
            await storage.saveToken(response.token);
            await storage.saveUserData(response.user);
            await storage.saveUserRole(response.user.userType);

            setToken(response.token);
            setUser(response.user);
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    };

    const googleSignup = async (tokenId: string, userType: UserType) => {
        try {
            const response = await authService.googleSignup(tokenId, userType);
            await storage.saveToken(response.token);
            await storage.saveUserData(response.user);
            await storage.saveUserRole(response.user.userType);
            setToken(response.token);
            setUser(response.user);
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
