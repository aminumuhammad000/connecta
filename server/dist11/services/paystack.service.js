"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_BASE_URL = 'https://api.paystack.co';
class PaystackService {
    constructor() {
        this.headers = {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
        };
    }
    /**
     * Initialize a payment transaction
     */
    async initializePayment(email, amount, reference, metadata) {
        try {
            const response = await axios_1.default.post(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
                email,
                amount: amount * 100, // Paystack uses kobo (smallest currency unit)
                reference,
                metadata,
                callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
            }, { headers: this.headers });
            return response.data;
        }
        catch (error) {
            console.error('Paystack initialization error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to initialize payment');
        }
    }
    /**
     * Verify a payment transaction
     */
    async verifyPayment(reference) {
        try {
            const response = await axios_1.default.get(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, { headers: this.headers });
            return response.data;
        }
        catch (error) {
            console.error('Paystack verification error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to verify payment');
        }
    }
    /**
     * Create a transfer recipient
     */
    async createTransferRecipient(accountNumber, bankCode, accountName) {
        try {
            const response = await axios_1.default.post(`${PAYSTACK_BASE_URL}/transferrecipient`, {
                type: 'nuban',
                name: accountName,
                account_number: accountNumber,
                bank_code: bankCode,
                currency: 'NGN',
            }, { headers: this.headers });
            return response.data;
        }
        catch (error) {
            console.error('Paystack recipient creation error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to create transfer recipient');
        }
    }
    /**
     * Initiate a transfer (withdrawal)
     */
    async initiateTransfer(recipientCode, amount, reference, reason) {
        try {
            const response = await axios_1.default.post(`${PAYSTACK_BASE_URL}/transfer`, {
                source: 'balance',
                amount: amount * 100, // Convert to kobo
                recipient: recipientCode,
                reference,
                reason: reason || 'Withdrawal from Connecta',
            }, { headers: this.headers });
            return response.data;
        }
        catch (error) {
            console.error('Paystack transfer error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to initiate transfer');
        }
    }
    /**
     * Verify transfer status
     */
    async verifyTransfer(reference) {
        try {
            const response = await axios_1.default.get(`${PAYSTACK_BASE_URL}/transfer/verify/${reference}`, { headers: this.headers });
            return response.data;
        }
        catch (error) {
            console.error('Paystack transfer verification error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to verify transfer');
        }
    }
    /**
     * List all banks
     */
    async listBanks() {
        try {
            const response = await axios_1.default.get(`${PAYSTACK_BASE_URL}/bank?currency=NGN`, { headers: this.headers });
            return response.data;
        }
        catch (error) {
            console.error('Paystack list banks error:', error.response?.data || error.message);
            throw new Error('Failed to fetch banks');
        }
    }
    /**
     * Resolve account number
     */
    async resolveAccountNumber(accountNumber, bankCode) {
        try {
            const response = await axios_1.default.get(`${PAYSTACK_BASE_URL}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, { headers: this.headers });
            return response.data;
        }
        catch (error) {
            console.error('Paystack account resolution error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to resolve account');
        }
    }
}
exports.default = new PaystackService();
