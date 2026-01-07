"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Payment_model_1 = __importDefault(require("../models/Payment.model"));
const Transaction_model_1 = __importDefault(require("../models/Transaction.model"));
const Wallet_model_1 = __importDefault(require("../models/Wallet.model"));
const Job_model_1 = __importDefault(require("../models/Job.model"));
const flutterwave_service_1 = __importDefault(require("./flutterwave.service"));
/**
 * Payment Service
 * Handles core payment business logic
 */
class PaymentService {
    /**
     * Process a successful payment
     */
    async processSuccessfulPayment(paymentId, transactionId, gatewayResponse) {
        // Find payment
        const payment = await Payment_model_1.default.findById(paymentId);
        if (!payment) {
            throw new Error('Payment not found');
        }
        // Check if already completed
        if (payment.status === 'completed') {
            return payment;
        }
        // If transactionId is provided, verify with gateway (double check)
        if (transactionId) {
            const verification = await flutterwave_service_1.default.verifyPayment(transactionId);
            if (verification.data.status !== 'successful' || verification.data.amount < payment.amount) {
                // Mark as failed if verification failed
                payment.status = 'failed';
                await payment.save();
                throw new Error('Payment verification failed at gateway');
            }
            gatewayResponse = verification.data;
        }
        // Update payment status
        payment.status = 'completed';
        payment.paidAt = new Date();
        payment.gatewayResponse = gatewayResponse;
        await payment.save();
        // Handle job verification payment
        if (payment.paymentType === 'job_verification' && payment.jobId) {
            await Job_model_1.default.findByIdAndUpdate(payment.jobId, {
                paymentVerified: true,
                paymentStatus: 'escrow',
                paymentId: payment._id,
                status: 'active',
            });
            return payment;
        }
        // Handle Project/Milestone Payment (Escrow)
        payment.escrowStatus = 'held';
        await payment.save();
        // 1. Update Client Wallet (Total Spent)
        let clientWallet = await Wallet_model_1.default.findOne({ userId: payment.payerId });
        if (!clientWallet) {
            clientWallet = new Wallet_model_1.default({ userId: payment.payerId });
        }
        clientWallet.totalSpent += payment.amount;
        await clientWallet.save();
        // 2. Update Freelancer Wallet (Escrow Balance)
        let freelancerWallet = await Wallet_model_1.default.findOne({ userId: payment.payeeId });
        if (!freelancerWallet) {
            freelancerWallet = new Wallet_model_1.default({ userId: payment.payeeId });
        }
        freelancerWallet.escrowBalance += payment.netAmount;
        freelancerWallet.balance += payment.netAmount; // Total balance includes escrow
        await freelancerWallet.save();
        // 3. Create Transactions
        // 3a. Client Sent Payment
        await Transaction_model_1.default.create({
            userId: payment.payerId,
            type: 'payment_sent',
            amount: -payment.amount,
            currency: payment.currency,
            status: 'completed',
            paymentId: payment._id,
            projectId: payment.projectId,
            balanceBefore: clientWallet.balance,
            balanceAfter: clientWallet.balance, // Balance doesn't change for client unless they funded wallet first. Assuming direct payment.
            description: `Payment sent for project`,
        });
        // 3b. Freelancer Received (Escrow)
        await Transaction_model_1.default.create({
            userId: payment.payeeId,
            type: 'payment_received',
            amount: payment.netAmount,
            currency: payment.currency,
            status: 'completed',
            paymentId: payment._id,
            projectId: payment.projectId,
            balanceBefore: freelancerWallet.balance - payment.netAmount,
            balanceAfter: freelancerWallet.balance,
            description: `Payment received (held in escrow)`,
        });
        return payment;
    }
}
exports.default = new PaymentService();
