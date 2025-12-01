import { get, post } from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Subscription Service
 * Handles subscription-related API calls
 */

export interface SubscriptionData {
    isPremium: boolean;
    subscriptionTier: 'free' | 'premium' | 'enterprise';
    subscriptionStatus: 'active' | 'expired' | 'cancelled';
    expiryDate?: string;
    daysUntilExpiry?: number;
    isExpiringSoon?: boolean;
}

/**
 * Get current user's subscription
 */
export const getMySubscription = async (): Promise<SubscriptionData> => {
    const response = await get<SubscriptionData>('/api/subscriptions/me');
    return (response as any)?.data || response;
};

/**
 * Upgrade subscription
 */
export const upgradeSubscription = async (tier: 'premium' | 'enterprise', durationMonths: number = 1): Promise<SubscriptionData> => {
    const response = await post<SubscriptionData>('/api/subscriptions/upgrade', { tier, durationMonths });
    return (response as any)?.data || response;
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async (): Promise<void> => {
    await post('/api/subscriptions/cancel', {});
};

export default {
    getMySubscription,
    upgradeSubscription,
    cancelSubscription,
};
