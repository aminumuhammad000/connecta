import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { STORAGE_KEYS } from './constants';
import { User } from '../types';

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
