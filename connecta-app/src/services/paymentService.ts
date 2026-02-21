import { get, post } from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { Payment, Transaction, WalletBalance, Bank } from '../types';

/**
 * Payment Service
 * Handles payment and wallet-related API calls
 */

/**
 * Initialize a payment
 */
export const initializePayment = async (paymentData: {
    projectId: string;
    amount: number;
    payeeId: string;
}): Promise<{ reference: string; authorizationUrl: string }> => {
    const response = await post(API_ENDPOINTS.INITIALIZE_PAYMENT, paymentData);
    return response.data!;
};

/**
 * Initialize job verification payment
 */
export const initializeJobVerification = async (verificationData: {
    jobId: string;
    amount: number;
    description: string;
}): Promise<{ reference: string; authorizationUrl: string }> => {
    const response = await post(API_ENDPOINTS.PAYMENT_JOB_VERIFICATION, verificationData);
    return response.data!;
};


/**
 * Verify a payment
 */
/**
 * Verify a payment
 */
export const verifyPayment = async (reference: string, transactionId: string): Promise<any> => {
    const response = await get<any>(`${API_ENDPOINTS.VERIFY_PAYMENT(reference)}?transaction_id=${transactionId}`);
    return response.data!;
};

/**
 * Get payment history
 */
export const getPaymentHistory = async (): Promise<Payment[]> => {
    const response = await get<Payment[]>(API_ENDPOINTS.PAYMENT_HISTORY);
    return response.data!;
};

/**
 * Get wallet balance
 */
export const getWalletBalance = async (): Promise<WalletBalance> => {
    const response = await get<WalletBalance>(API_ENDPOINTS.WALLET_BALANCE);
    return (response as any)?.data || response;
};

/**
 * Get transaction history
 */
export const getTransactions = async (): Promise<Transaction[]> => {
    const response = await get<Transaction[]>(API_ENDPOINTS.TRANSACTIONS);
    return Array.isArray(response) ? response : (response as any)?.data || [];
};

/**
 * Request withdrawal
 */
export const requestWithdrawal = async (withdrawalData: {
    amount: number;
    bankCode?: string;
    accountNumber?: string;
}): Promise<any> => {
    // Transform to match backend expectation
    const payload = {
        amount: withdrawalData.amount,
        bankDetails: {
            bankCode: withdrawalData.bankCode,
            accountNumber: withdrawalData.accountNumber
        }
    };
    const response = await post(API_ENDPOINTS.WITHDRAWAL_REQUEST, payload);
    return response.data!;
};

/**
 * Get available banks
 */
export const getBanks = async (): Promise<Bank[]> => {
    const response = await get<Bank[]>(API_ENDPOINTS.BANKS);
    return response.data!;
};

/**
 * Resolve bank account
 */
export const resolveBankAccount = async (accountNumber: string, bankCode: string): Promise<any> => {
    const response = await post(API_ENDPOINTS.RESOLVE_BANK, { accountNumber, bankCode });
    return response.data!;
};

/**
 * Save withdrawal settings
 */
export const saveWithdrawalSettings = async (settings: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    bankCode: string;
}): Promise<any> => {
    const response = await post(API_ENDPOINTS.WITHDRAWAL_SETTINGS, settings);
    return response.data!;
};

/**
 * Release payment from escrow
 */
export const releasePayment = async (paymentId: string): Promise<Payment> => {
    const response = await post(API_ENDPOINTS.RELEASE_PAYMENT(paymentId), {});
    return response.data;
};

/**
 * Admin: Get pending withdrawals
 */
export const getPendingWithdrawals = async (): Promise<any[]> => {
    const response = await get<any[]>('/api/payments/admin/withdrawals');
    return Array.isArray(response) ? response : (response as any)?.data || [];
};

/**
 * Admin: Process withdrawal
 */
export const processWithdrawal = async (withdrawalId: string): Promise<any> => {
    const response = await post(`/api/payments/withdrawal/${withdrawalId}/process`, {});
    return response.data;
};

export default {
    initializePayment,
    initializeJobVerification,
    verifyPayment,
    getPaymentHistory,
    getWalletBalance,
    getTransactions,
    requestWithdrawal,
    getBanks,
    resolveBankAccount,
    saveWithdrawalSettings,
    releasePayment,
    getPendingWithdrawals,
    processWithdrawal,
};
