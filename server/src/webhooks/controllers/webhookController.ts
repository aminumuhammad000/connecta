import { Request, Response } from 'express';
import paymentService from '../../services/payment.service';

/**
 * Handle Flutterwave Webhook
 */
export const handleWebhook = async (req: Request, res: Response) => {
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
            await paymentService.processSuccessfulPayment(tx_ref, id.toString());

            console.log(`Payment processed via webhook: ${tx_ref}`);
        }

        // Always return 200 OK to acknowledge receipt
        res.status(200).send('Webhook received');
    } catch (error: any) {
        console.error('Webhook processing error:', error);
        // Return 200 even on error to prevent continuous retries for bad payloads
        res.status(200).send('Error processing webhook');
    }
};