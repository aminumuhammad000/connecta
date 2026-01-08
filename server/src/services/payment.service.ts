import Payment from '../models/Payment.model';
import Transaction from '../models/Transaction.model';
import Wallet from '../models/Wallet.model';
import Job from '../models/Job.model';
import flutterwaveService from './flutterwave.service';

/**
 * Payment Service
 * Handles core payment business logic
 */
class PaymentService {
    /**
     * Process a successful payment
     */
    async processSuccessfulPayment(paymentId: string, transactionId?: string, gatewayResponse?: any) {
        // Find payment
        const payment = await Payment.findById(paymentId);
        if (!payment) {
            throw new Error('Payment not found');
        }

        // Check if already completed
        if (payment.status === 'completed') {
            return payment;
        }

        // If transactionId is provided, verify with gateway (double check)
        if (transactionId) {
            const verification = await flutterwaveService.verifyPayment(transactionId);
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
            await Job.findByIdAndUpdate(payment.jobId, {
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
        let clientWallet = await Wallet.findOne({ userId: payment.payerId });
        if (!clientWallet) {
            clientWallet = new Wallet({ userId: payment.payerId });
        }
        clientWallet.totalSpent += payment.amount;
        await clientWallet.save();

        // 2. Update Freelancer Wallet (Escrow Balance)
        let freelancerWallet = await Wallet.findOne({ userId: payment.payeeId });
        if (!freelancerWallet) {
            freelancerWallet = new Wallet({ userId: payment.payeeId });
        }
        freelancerWallet.escrowBalance += payment.netAmount;
        freelancerWallet.balance += payment.netAmount; // Total balance includes escrow
        await freelancerWallet.save();

        // 3. Create Transactions
        // 3a. Client Sent Payment
        await Transaction.create({
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
        await Transaction.create({
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

        // Notify Client (Receipt)
        try {
            const User = require('../models/user.model').default;
            const { sendPaymentReceiptEmail } = require('../services/email.service');
            const io = require('../core/utils/socketIO').getIO();
            const mongoose = require('mongoose');

            const client = await User.findById(payment.payerId);
            // Project might be null if job_verification
            let projectTitle = 'Project';
            if (payment.projectId) {
                try {
                    const Project = require('../models/Project.model').default;
                    const proj = await Project.findById(payment.projectId);
                    if (proj) projectTitle = proj.title;
                } catch (e) { }
            } else if (payment.jobId) {
                try {
                    const job = await Job.findById(payment.jobId);
                    if (job) projectTitle = job.title;
                } catch (e) { }
            }

            if (client && client.email) {
                await sendPaymentReceiptEmail(client.email, client.firstName, `${payment.currency} ${payment.amount}`, projectTitle);

                await mongoose.model('Notification').create({
                    userId: payment.payerId,
                    type: 'payment_sent',
                    title: 'Payment Successful',
                    message: `You paid ${payment.currency} ${payment.amount} for "${projectTitle}"`,
                    relatedId: payment._id,
                    relatedType: 'payment',
                    actorId: payment.payerId,
                    actorName: 'System',
                    isRead: false
                });

                io.to(payment.payerId.toString()).emit('notification:new', {
                    title: 'Payment Successful',
                    message: `You paid ${payment.currency} ${payment.amount}`,
                    type: 'payment_sent'
                });

                // Push Notification
                const notificationService = require('../services/notification.service').default;
                notificationService.sendPushNotification(
                    payment.payerId,
                    'Payment Successful ✅',
                    `You paid ${payment.currency} ${payment.amount} for "${projectTitle}"`,
                    { paymentId: payment._id, type: 'payment' }
                );
            }
        } catch (e) { console.error('Payment receipt error', e); }

        return payment;
    }
}

export default new PaymentService();
