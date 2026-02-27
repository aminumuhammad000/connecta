import { get, post } from './api';
import { API_ENDPOINTS } from '../utils/constants';
import * as storage from '../utils/storage';
import * as Haptics from 'expo-haptics';

export interface RewardAction {
    id: string;
    title: string;
    description: string;
    sparks: number;
    type: 'identity' | 'trust' | 'consistency' | 'milestone';
    completed: boolean;
    icon: string;
}

export const getRewardActions = async (): Promise<RewardAction[]> => {
    // In a real app, this would fetch from the backend based on user progress
    // Mocking for premium UI experience for now
    return [
        {
            id: 'daily_return',
            title: 'The Morning Spark',
            description: 'Start your professional day on Connecta.',
            sparks: 5,
            type: 'consistency',
            completed: false,
            icon: 'wb-sunny'
        },
        {
            id: 'photo_upload',
            title: 'The Identity Mirror',
            description: 'Add a professional photo to your profile.',
            sparks: 20,
            type: 'identity',
            completed: true,
            icon: 'face'
        },
        {
            id: 'kano_trust',
            title: 'The Kano Shield',
            description: 'Verify your local trust connection.',
            sparks: 50,
            type: 'trust',
            completed: false,
            icon: 'verified-user'
        },
        {
            id: 'skills_surge',
            title: 'Professional Surge',
            description: 'Add 5 skills to show your expertise.',
            sparks: 30,
            type: 'identity',
            completed: false,
            icon: 'bolt'
        }
    ];
};

export const getRewardBalance = async (): Promise<number> => {
    try {
        const response = await get<any>(API_ENDPOINTS.REWARD_BALANCE);
        const data = (response as any)?.data || response;
        return data?.currentBalance || data?.balance || 0;
    } catch (error) {
        console.error('Failed to get reward balance:', error);
        return 0;
    }
};

export const claimReward = async (actionId: string): Promise<number> => {
    try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Call backend to update sparks via rewards microservice
        const response = await post<any>(API_ENDPOINTS.CLAIM_REWARD, { actionId });
        return response?.data?.newSparkTotal || 0;
    } catch (error) {
        console.error('Failed to claim reward:', error);
        throw error;
    }
};

export const checkDailyCheckIn = async (): Promise<{ earned: boolean; totalSparks: number }> => {
    const lastCheckIn = await storage.getItem('LAST_CHECK_IN');
    const today = new Date().toISOString().split('T')[0];

    if (lastCheckIn !== today) {
        try {
            const newTotal = await claimReward('daily_return');
            await storage.setItem('LAST_CHECK_IN', today);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            return { earned: true, totalSparks: newTotal };
        } catch (error) {
            console.error('Daily check-in claim failed:', error);
        }
    }

    return { earned: false, totalSparks: 0 };
};
export const validateRecipient = async (query: { email?: string, userId?: string }): Promise<any> => {
    try {
        const response = await post<any>(API_ENDPOINTS.VALIDATE_RECIPIENT, query);
        const data = (response as any)?.data || response;
        return data;
    } catch (error) {
        console.error('Failed to validate recipient:', error);
        throw error;
    }
};

export const transferSparks = async (data: { recipientEmail: string, amount: number, transactionPin: string }): Promise<any> => {
    try {
        const response = await post<any>(API_ENDPOINTS.TRANSFER_SPARKS, {
            recipientEmail: data.recipientEmail,
            amount: data.amount,
            pin: data.transactionPin
        });
        return response?.data || response;
    } catch (error) {
        console.error('Failed to transfer sparks:', error);
        throw error;
    }
};

export const getSparkHistory = async (): Promise<any[]> => {
    try {
        const response = await get<any>(API_ENDPOINTS.SPARK_HISTORY);
        const data = (response as any)?.data || response;
        return data?.transactions || [];
    } catch (error) {
        console.error('Failed to get spark history:', error);
        return [];
    }
};

export const checkHasPin = async (): Promise<boolean> => {
    try {
        const response = await get<any>(API_ENDPOINTS.CHECK_HAS_PIN);
        const data = (response as any)?.data || response;
        return data?.hasPin || false;
    } catch (error) {
        console.error('Failed to check PIN status:', error);
        return false;
    }
};

export const setTransactionPin = async (pin: string): Promise<any> => {
    try {
        const response = await post<any>(API_ENDPOINTS.SET_TRANSACTION_PIN, { pin });
        return response?.data || response;
    } catch (error) {
        console.error('Failed to set transaction PIN:', error);
        throw error;
    }
};
