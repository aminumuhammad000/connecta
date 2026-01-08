"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWebhook = void 0;
const payment_service_1 = __importDefault(require("../../services/payment.service"));
/**
 * Handle Flutterwave Webhook
 */
const handleWebhook = async (req, res) => {
    try {
        // 1. Verify Webhook Signature (Optional but recommended)
        const secretHash = process.env.FLUTTERWAVE_SECRET_HASH || 'default-secret-hash';
        const signature = req.headers['verif-hash'];
        if (!signature || signature !== secretHash) {
            // If hash doesn't match, ignore request (or return 401 if strict)
            // Returning 200 ensures they don't keep retrying if it's just a config mismatch
            console.warn('Webhook signature mismatch', { received: signature, expected: secretHash });
            return res.status(200).send('Invalid signature');
        }
        const payload = req.body;
        console.log('Received Webhook:', JSON.stringify(payload, null, 2));
        // 2. Handle specific events
        if (payload.event === 'charge.completed' && payload.data.status === 'successful') {
            const { tx_ref, id } = payload.data;
            // Process payment
            // We pass the transaction ID to verify it one last time with the gateway
            await payment_service_1.default.processSuccessfulPayment(tx_ref, id.toString());
            console.log(`Payment processed via webhook: ${tx_ref}`);
        }
        // Always return 200 OK to acknowledge receipt
        res.status(200).send('Webhook received');
    }
    catch (error) {
        console.error('Webhook processing error:', error);
        // Return 200 even on error to prevent continuous retries for bad payloads
        res.status(200).send('Error processing webhook');
    }
};
exports.handleWebhook = handleWebhook;
