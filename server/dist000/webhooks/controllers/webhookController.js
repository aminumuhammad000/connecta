"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWebhook = void 0;
const Payment_model_1 = __importDefault(require("../../models/Payment.model"));
const Job_model_1 = __importDefault(require("../../models/Job.model"));
const flutterwave_service_1 = __importDefault(require("../../services/flutterwave.service"));
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
            console.log(`Processing Webhook for ref: ${tx_ref}`);
            // Verify with Gateway (Double check)
            const flwResponse = await flutterwave_service_1.default.verifyPayment(id.toString());
            if (flwResponse.status === 'success' && flwResponse.data.status === 'successful') {
                // Find Payment
                const payment = await Payment_model_1.default.findById(tx_ref);
                if (payment && payment.status !== 'completed') {
                    // Verify Amount
                    if (payment.amount <= flwResponse.data.amount) {
                        // Update Payment
                        payment.status = 'completed';
                        payment.gatewayResponse = flwResponse.data;
                        payment.paidAt = new Date();
                        await payment.save();
                        // Handle Job Verification
                        if (payment.paymentType === 'job_verification' && payment.jobId) {
                            const job = await Job_model_1.default.findById(payment.jobId);
                            if (job) {
                                job.paymentVerified = true;
                                job.paymentStatus = 'escrow';
                                await job.save();
                            }
                        }
                        console.log(`Payment completed via webhook: ${tx_ref}`);
                    }
                    else {
                        console.error('Webhook amount mismatch', { expected: payment.amount, received: flwResponse.data.amount });
                    }
                }
                else {
                    console.log('Payment already completed or not found for ref:', tx_ref);
                }
            }
            else {
                console.error('Webhook verification failed with gateway', flwResponse);
            }
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
