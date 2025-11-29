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
}): Promise<{ reference: string; authorizationUrl: string }> => {
    const response = await post(API_ENDPOINTS.INITIALIZE_PAYMENT, paymentData);
    return response.data!;
};

/**
 * Verify a payment
 */
export const verifyPayment = async (reference: string): Promise<Payment> => {
    const response = await get<Payment>(API_ENDPOINTS.VERIFY_PAYMENT(reference));
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
    bankCode: string;
    accountNumber: string;
}): Promise<any> => {
    const response = await post(API_ENDPOINTS.WITHDRAWAL_REQUEST, withdrawalData);
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

export default {
    initializePayment,
    verifyPayment,
    getPaymentHistory,
    getWalletBalance,
    getTransactions,
    requestWithdrawal,
    getBanks,
    resolveBankAccount,
};
