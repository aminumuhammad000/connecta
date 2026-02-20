import api from './api';
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
    // Mocking for premium UI experience
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

export const claimReward = async (actionId: string): Promise<number> => {
    try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Call backend to update sparks
        const response = await api.post(`/profile/rewards/claim`, { actionId });
        return response.data.newSparkTotal;
    } catch (error) {
        console.error('Failed to claim reward:', error);
        throw error;
    }
};

export const checkDailyCheckIn = async (): Promise<{ earned: boolean; totalSparks: number }> => {
    const lastCheckIn = await storage.getItem('LAST_CHECK_IN');
    const today = new Date().toISOString().split('T')[0];

    if (lastCheckIn !== today) {
        // Mocking API call to earn daily spark
        await storage.setItem('LAST_CHECK_IN', today);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        return { earned: true, totalSparks: 5 }; // Increment logically
    }

    return { earned: false, totalSparks: 0 };
};
