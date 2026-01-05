"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const FLUTTERWAVE_SECRET_KEY = 'FLWSECK_TEST-8f427e73ba259780bd824c1bd7b9ef67-X';
const FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3';
class FlutterwaveService {
    constructor() {
        this.headers = {
            Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
            'Content-Type': 'application/json',
        };
    }
    /**
     * Initialize a payment transaction
     */
    async initializePayment(email, amount, reference, metadata) {
        try {
            const payload = {
                tx_ref: reference,
                amount,
                currency: 'NGN',
                redirect_url: 'https://connecta.app/payment/callback', // This will be intercepted by the WebView
                payment_options: 'card',
                meta: metadata,
                customer: {
                    email,
                },
                customizations: {
                    title: 'Connecta Payment',
                    description: 'Payment for job posting',
                    logo: 'https://connecta.app/logo.png', // Optional
                },
            };
            console.log('Sending payload to Flutterwave:', JSON.stringify(payload, null, 2));
            const response = await axios_1.default.post(`${FLUTTERWAVE_BASE_URL}/payments`, payload, { headers: this.headers });
            return response.data;
        }
        catch (error) {
            console.error('Flutterwave initialization error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to initialize payment');
        }
    }
    /**
     * Verify a payment transaction
     */
    async verifyPayment(transactionId) {
        try {
            const response = await axios_1.default.get(`${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/verify`, { headers: this.headers });
            return response.data;
        }
        catch (error) {
            console.error('Flutterwave verification error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to verify payment');
        }
    }
    /**
     * List all banks
     */
    async listBanks() {
        try {
            const response = await axios_1.default.get(`${FLUTTERWAVE_BASE_URL}/banks/NG`, { headers: this.headers });
            return response.data;
        }
        catch (error) {
            console.error('Flutterwave list banks error:', error.response?.data || error.message);
            throw new Error('Failed to fetch banks');
        }
    }
    /**
     * Resolve account number
     */
    async resolveAccount(accountNumber, bankCode) {
        try {
            const response = await axios_1.default.post(`${FLUTTERWAVE_BASE_URL}/accounts/resolve`, {
                account_number: accountNumber,
                account_bank: bankCode,
            }, { headers: this.headers });
            return response.data;
        }
        catch (error) {
            console.error('Flutterwave account resolution error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to resolve account');
        }
    }
    /**
     * Initiate a transfer (withdrawal)
     */
    async initiateTransfer(accountBank, accountNumber, amount, narration, reference) {
        try {
            const response = await axios_1.default.post(`${FLUTTERWAVE_BASE_URL}/transfers`, {
                account_bank: accountBank,
                account_number: accountNumber,
                amount,
                currency: 'NGN',
                narration: narration || 'Withdrawal from Connecta',
                reference,
            }, { headers: this.headers });
            return response.data;
        }
        catch (error) {
            console.error('Flutterwave transfer error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to initiate transfer');
        }
    }
}
exports.default = new FlutterwaveService();
