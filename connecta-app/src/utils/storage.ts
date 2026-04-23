import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { STORAGE_KEYS } from './constants';
import { User, Profile } from '../types';

/**
 * Storage utility for managing AsyncStorage operations
 */

// Token Management
export const saveToken = async (token: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
        console.error('Error saving token:', error);
        throw error;
    }
};

export const getToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
        console.error('Error getting token:', error);
        return null;
    }
};

export const removeToken = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
        console.error('Error removing token:', error);
        throw error;
    }
};

// User Data Management
export const saveUserData = async (user: User): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    } catch (error) {
        console.error('Error saving user data:', error);
        throw error;
    }
};

export const getUserData = async (): Promise<User | null> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
};

export const removeUserData = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
        console.error('Error removing user data:', error);
        throw error;
    }
};

// Profile Data Management
export const saveProfileData = async (profile: Profile): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.PROFILE_DATA, JSON.stringify(profile));
    } catch (error) {
        console.error('Error saving profile data:', error);
        throw error;
    }
};

export const getProfileData = async (): Promise<Profile | null> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE_DATA);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error getting profile data:', error);
        return null;
    }
};

export const removeProfileData = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEYS.PROFILE_DATA);
    } catch (error) {
        console.error('Error removing profile data:', error);
        throw error;
    }
};

// Cached Profiles (Public Profiles)
export const saveCachedProfile = async (userId: string, profile: Profile): Promise<void> => {
    try {
        const key = `${STORAGE_KEYS.PROFILE_CACHE}${userId}`;
        await AsyncStorage.setItem(key, JSON.stringify(profile));
    } catch (error) {
        console.error(`Error caching profile for ${userId}:`, error);
    }
};

export const getCachedProfile = async (userId: string): Promise<Profile | null> => {
    try {
        const key = `${STORAGE_KEYS.PROFILE_CACHE}${userId}`;
        const data = await AsyncStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`Error getting cached profile for ${userId}:`, error);
        return null;
    }
};

// User Role Management
export const saveUserRole = async (role: 'client' | 'freelancer'): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
    } catch (error) {
        console.error('Error saving user role:', error);
        throw error;
    }
};

export const getUserRole = async (): Promise<'client' | 'freelancer' | null> => {
    try {
        const role = await AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE);
        return role as 'client' | 'freelancer' | null;
    } catch (error) {
        console.error('Error getting user role:', error);
        return null;
    }
};

export const removeUserRole = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_ROLE);
    } catch (error) {
        console.error('Error removing user role:', error);
        throw error;
    }
};

// Clear All Data (Logout)
export const clearAllData = async (): Promise<void> => {
    try {
        await AsyncStorage.multiRemove([
            STORAGE_KEYS.AUTH_TOKEN,
            STORAGE_KEYS.USER_DATA,
            STORAGE_KEYS.USER_ROLE,
            STORAGE_KEYS.PROFILE_DATA,
        ]);
    } catch (error) {
        console.error('Error clearing all data:', error);
        throw error;
    }
};

// Generic Storage Methods
export const setItem = async (key: string, value: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(key, value);
    } catch (error) {
        console.error(`Error setting item ${key}:`, error);
        throw error;
    }
};

export const getItem = async (key: string): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(key);
    } catch (error) {
        console.error(`Error getting item ${key}:`, error);
        return null;
    }
};

export const removeItem = async (key: string): Promise<void> => {
    try {
        await AsyncStorage.removeItem(key);
    } catch (error) {
        console.error(`Error removing item ${key}:`, error);
        throw error;
    }
};

// Secure Storage Methods
export const setSecureItem = async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
        return setItem(key, value);
    }
    try {
        await SecureStore.setItemAsync(key, value);
    } catch (error) {
        console.error(`Error setting secure item ${key}:`, error);
        throw error;
    }
};

export const getSecureItem = async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
        return getItem(key);
    }
    try {
        return await SecureStore.getItemAsync(key);
    } catch (error) {
        console.error(`Error getting secure item ${key}:`, error);
        return null;
    }
};

export const removeSecureItem = async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
        return removeItem(key);
    }
    try {
        await SecureStore.deleteItemAsync(key);
    } catch (error) {
        console.error(`Error removing secure item ${key}:`, error);
        throw error;
    }
};
// Pending Signup Management
export const savePendingSignupData = async (data: any): Promise<void> => {
    try {
        const existing = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_SIGNUP);
        const merged = existing ? { ...JSON.parse(existing), ...data } : data;
        await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SIGNUP, JSON.stringify(merged));
    } catch (error) {
        console.error('Error saving pending signup data:', error);
    }
};

export const getPendingSignupData = async (): Promise<any> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_SIGNUP);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error getting pending signup data:', error);
        return null;
    }
};

export const clearPendingSignupData = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_SIGNUP);
    } catch (error) {
        console.error('Error clearing pending signup data:', error);
    }
};
// Daily Reward Management
export const saveLastDailyRewardShown = async (): Promise<void> => {
    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_DAILY_REWARD_SHOWN, today);
    } catch (error) {
        console.error('Error saving last daily reward shown:', error);
    }
};

export const isDailyRewardShownToday = async (): Promise<boolean> => {
    try {
        const lastShown = await AsyncStorage.getItem(STORAGE_KEYS.LAST_DAILY_REWARD_SHOWN);
        const today = new Date().toISOString().split('T')[0];
        return lastShown === today;
    } catch (error) {
        console.error('Error checking if daily reward shown today:', error);
        return false;
    }
};
