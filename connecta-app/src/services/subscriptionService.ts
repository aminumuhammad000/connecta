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
 * Initialize upgrade payment
 */
export const initializeUpgradePayment = async (tier: 'premium' | 'enterprise', durationMonths: number = 1): Promise<{ reference: string; authorizationUrl: string }> => {
    const response = await post<{ reference: string; authorizationUrl: string }>('/api/subscriptions/initialize-upgrade', { tier, durationMonths });
    return (response as any)?.data || response;
};

/**
 * Verify upgrade payment
 */
export const verifyUpgradePayment = async (transactionId: string, txRef: string): Promise<SubscriptionData> => {
    const response = await post<SubscriptionData>('/api/subscriptions/verify-upgrade', { transaction_id: transactionId, tx_ref: txRef });
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
    initializeUpgradePayment,
    verifyUpgradePayment,
    cancelSubscription,
};
