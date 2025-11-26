"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPayments = exports.resolveAccount = exports.getBanks = exports.getTransactionHistory = exports.processWithdrawal = exports.requestWithdrawal = exports.getWalletBalance = exports.getPaymentHistory = exports.refundPayment = exports.releasePayment = exports.verifyPayment = exports.initializePayment = exports.initializeJobVerification = void 0;
const Payment_model_1 = __importDefault(require("../models/Payment.model"));
const Transaction_model_1 = __importDefault(require("../models/Transaction.model"));
const Wallet_model_1 = __importDefault(require("../models/Wallet.model"));
const Withdrawal_model_1 = __importDefault(require("../models/Withdrawal.model"));
const Project_model_1 = __importDefault(require("../models/Project.model"));
const Job_model_1 = __importDefault(require("../models/Job.model"));
const paystack_service_1 = __importDefault(require("../services/paystack.service"));
// Platform fee percentage (e.g., 10%)
const PLATFORM_FEE_PERCENTAGE = 10;
/**
 * Initialize job verification payment
 */
const initializeJobVerification = async (req, res) => {
    try {
        const { jobId, amount, description } = req.body;
        const userId = req.user?.id || req.user?._id || req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        if (!jobId || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: jobId, amount',
            });
        }
        // Verify job exists and belongs to user
        const job = await Job_model_1.default.findById(jobId);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }
        if (job.clientId.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Not authorized for this job' });
        }
        // Create payment record for job verification
        const payment = new Payment_model_1.default({
            jobId,
            payerId: userId,
            payeeId: userId, // Self-payment for verification
            amount,
            platformFee: 0, // No platform fee for verification
            netAmount: amount,
            currency: 'NGN',
            paymentType: 'job_verification',
            description: description || `Job verification payment for ${job.title}`,
            status: 'pending',
            escrowStatus: 'none',
        });
        await payment.save();
        // Initialize Paystack payment
        const user = req.user;
        const paystackResponse = await paystack_service_1.default.initializePayment(user.email, amount, payment._id.toString(), { jobId, userId, type: 'job_verification' });
        // Update payment with gateway reference
        payment.gatewayReference = paystackResponse.data.reference;
        payment.gatewayResponse = paystackResponse.data;
        await payment.save();
        return res.status(200).json({
            success: true,
            message: 'Job verification payment initialized',
            data: {
                paymentId: payment._id,
                authorizationUrl: paystackResponse.data.authorization_url,
                reference: paystackResponse.data.reference,
            },
        });
    }
    catch (error) {
        console.error('Job verification payment error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to initialize job verification payment',
        });
    }
};
exports.initializeJobVerification = initializeJobVerification;
/**
 * Initialize payment for a project/milestone
 */
const initializePayment = async (req, res) => {
    try {
        const { projectId, milestoneId, amount, payeeId, description } = req.body;
        const payerId = req.user?.id || req.user?._id || req.user?.userId;
        if (!payerId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        if (!projectId || !amount || !payeeId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: projectId, amount, payeeId',
            });
        }
        // Verify project exists
        const project = await Project_model_1.default.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        // Calculate platform fee
        const platformFee = (amount * PLATFORM_FEE_PERCENTAGE) / 100;
        const netAmount = amount - platformFee;
        // Check if there's already a pending payment for this project
        let payment = await Payment_model_1.default.findOne({
            projectId,
            status: 'pending',
            payerId,
            payeeId,
        });
        if (payment) {
            // Update existing pending payment
            payment.amount = amount;
            payment.platformFee = platformFee;
            payment.netAmount = netAmount;
            payment.description = description || `Payment for ${project.title}`;
            payment.milestoneId = milestoneId;
            payment.paymentType = milestoneId ? 'milestone' : 'full_payment';
        }
        else {
            // Create new payment record
            payment = new Payment_model_1.default({
                projectId,
                milestoneId,
                payerId,
                payeeId,
                amount,
                platformFee,
                netAmount,
                currency: 'NGN',
                paymentType: milestoneId ? 'milestone' : 'full_payment',
                description: description || `Payment for ${project.title}`,
                status: 'pending',
                escrowStatus: 'none',
            });
        }
        await payment.save();
        // Initialize Paystack payment
        const user = req.user;
        const paystackResponse = await paystack_service_1.default.initializePayment(user.email, amount, payment._id.toString(), {
            projectId,
            milestoneId,
            payerId,
            payeeId,
        });
        // Update payment with gateway reference
        payment.gatewayReference = paystackResponse.data.reference;
        payment.gatewayResponse = paystackResponse.data;
        await payment.save();
        return res.status(200).json({
            success: true,
            message: 'Payment initialized successfully',
            data: {
                paymentId: payment._id,
                authorizationUrl: paystackResponse.data.authorization_url,
                reference: paystackResponse.data.reference,
            },
        });
    }
    catch (error) {
        console.error('Initialize payment error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to initialize payment',
        });
    }
};
exports.initializePayment = initializePayment;
/**
 * Verify payment after Paystack callback
 */
const verifyPayment = async (req, res) => {
    try {
        const { reference } = req.params;
        if (!reference) {
            return res.status(400).json({ success: false, message: 'Reference is required' });
        }
        // Find payment by reference
        const payment = await Payment_model_1.default.findOne({ gatewayReference: reference });
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }
        // Verify with Paystack
        const verification = await paystack_service_1.default.verifyPayment(reference);
        if (verification.data.status === 'success') {
            // Update payment status
            payment.status = 'completed';
            payment.paidAt = new Date();
            payment.gatewayResponse = verification.data;
            await payment.save();
            // Handle job verification payment differently
            if (payment.paymentType === 'job_verification' && payment.jobId) {
                // Update job as payment verified
                await Job_model_1.default.findByIdAndUpdate(payment.jobId, {
                    paymentVerified: true,
                    paymentId: payment._id,
                });
                return res.status(200).json({
                    success: true,
                    message: 'Job verification payment successful',
                    data: { payment, jobVerified: true },
                });
            }
            // Regular project/milestone payment handling
            // Update payment to held in escrow
            payment.escrowStatus = 'held';
            await payment.save();
            // Get or create client wallet
            let clientWallet = await Wallet_model_1.default.findOne({ userId: payment.payerId });
            if (!clientWallet) {
                clientWallet = new Wallet_model_1.default({ userId: payment.payerId });
            }
            // Update client wallet
            clientWallet.totalSpent += payment.amount;
            await clientWallet.save();
            // Get or create freelancer wallet
            let freelancerWallet = await Wallet_model_1.default.findOne({ userId: payment.payeeId });
            if (!freelancerWallet) {
                freelancerWallet = new Wallet_model_1.default({ userId: payment.payeeId });
            }
            // Add to escrow (money held until work is approved)
            freelancerWallet.escrowBalance += payment.netAmount;
            freelancerWallet.balance += payment.netAmount;
            await freelancerWallet.save();
            // Create transaction records
            await Transaction_model_1.default.create({
                userId: payment.payerId,
                type: 'payment_sent',
                amount: -payment.amount,
                currency: payment.currency,
                status: 'completed',
                paymentId: payment._id,
                projectId: payment.projectId,
                balanceBefore: clientWallet.balance,
                balanceAfter: clientWallet.balance,
                description: `Payment sent for project`,
            });
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
            return res.status(200).json({
                success: true,
                message: 'Payment verified successfully',
                data: payment,
            });
        }
        else {
            payment.status = 'failed';
            await payment.save();
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed',
            });
        }
    }
    catch (error) {
        console.error('Verify payment error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to verify payment',
        });
    }
};
exports.verifyPayment = verifyPayment;
/**
 * Release payment from escrow (after work approval)
 */
const releasePayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const userId = req.user?.id || req.user?._id || req.user?.userId;
        const payment = await Payment_model_1.default.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }
        // Only payer (client) can release payment
        if (payment.payerId.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized to release payment' });
        }
        if (payment.escrowStatus !== 'held') {
            return res.status(400).json({
                success: false,
                message: 'Payment is not in escrow',
            });
        }
        // Update payment
        payment.escrowStatus = 'released';
        payment.releasedAt = new Date();
        await payment.save();
        // Update freelancer wallet
        const freelancerWallet = await Wallet_model_1.default.findOne({ userId: payment.payeeId });
        if (freelancerWallet) {
            freelancerWallet.escrowBalance -= payment.netAmount;
            freelancerWallet.totalEarnings += payment.netAmount;
            await freelancerWallet.save();
        }
        return res.status(200).json({
            success: true,
            message: 'Payment released successfully',
            data: payment,
        });
    }
    catch (error) {
        console.error('Release payment error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to release payment',
        });
    }
};
exports.releasePayment = releasePayment;
/**
 * Request refund
 */
const refundPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { reason } = req.body;
        const userId = req.user?.id || req.user?._id || req.user?.userId;
        const payment = await Payment_model_1.default.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }
        // Only payer can request refund
        if (payment.payerId.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        if (payment.escrowStatus !== 'held') {
            return res.status(400).json({
                success: false,
                message: 'Payment cannot be refunded',
            });
        }
        // Update payment
        payment.status = 'refunded';
        payment.escrowStatus = 'refunded';
        payment.refundedAt = new Date();
        payment.metadata = { ...payment.metadata, refundReason: reason };
        await payment.save();
        // Update freelancer wallet
        const freelancerWallet = await Wallet_model_1.default.findOne({ userId: payment.payeeId });
        if (freelancerWallet) {
            freelancerWallet.escrowBalance -= payment.netAmount;
            freelancerWallet.balance -= payment.netAmount;
            await freelancerWallet.save();
        }
        // Create refund transaction
        await Transaction_model_1.default.create({
            userId: payment.payerId,
            type: 'refund',
            amount: payment.amount,
            currency: payment.currency,
            status: 'completed',
            paymentId: payment._id,
            projectId: payment.projectId,
            description: `Refund for payment`,
        });
        return res.status(200).json({
            success: true,
            message: 'Payment refunded successfully',
            data: payment,
        });
    }
    catch (error) {
        console.error('Refund payment error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to refund payment',
        });
    }
};
exports.refundPayment = refundPayment;
/**
 * Get payment history
 */
const getPaymentHistory = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.user?.userId;
        const { page = 1, limit = 20, status, type } = req.query;
        const query = {
            $or: [{ payerId: userId }, { payeeId: userId }],
        };
        if (status)
            query.status = status;
        if (type)
            query.paymentType = type;
        const payments = await Payment_model_1.default.find(query)
            .populate('payerId', 'firstName lastName email')
            .populate('payeeId', 'firstName lastName email')
            .populate('projectId', 'title')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const total = await Payment_model_1.default.countDocuments(query);
        return res.status(200).json({
            success: true,
            data: payments,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error('Get payment history error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch payment history',
        });
    }
};
exports.getPaymentHistory = getPaymentHistory;
/**
 * Get wallet balance with project data
 */
const getWalletBalance = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.user?.userId;
        // Check if userId exists
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - User ID not found',
            });
        }
        // Get or create wallet
        let wallet = await Wallet_model_1.default.findOne({ userId });
        if (!wallet) {
            wallet = new Wallet_model_1.default({ userId });
            await wallet.save();
        }
        // Fetch ongoing projects for freelancer
        const ongoingProjects = await Project_model_1.default.find({
            freelancerId: userId,
            status: 'ongoing',
        }).select('title budget status clientName');
        // Fetch payments related to user's projects
        const payments = await Payment_model_1.default.find({
            payeeId: userId,
            status: 'completed',
        }).populate('projectId', 'title').catch(() => []);
        // Calculate pending payments (projects without completed payments)
        let pendingAmount = 0;
        for (const project of ongoingProjects) {
            if (!project || !project._id)
                continue;
            const hasPayment = payments.some((p) => {
                if (!p || !p.projectId)
                    return false;
                const projectIdStr = typeof p.projectId === 'object' && p.projectId._id
                    ? p.projectId._id.toString()
                    : p.projectId.toString();
                return projectIdStr === project._id.toString();
            });
            if (!hasPayment && project.budget && project.budget.amount) {
                pendingAmount += project.budget.amount;
            }
        }
        // Calculate actual escrow balance from payments
        const escrowPayments = await Payment_model_1.default.find({
            payeeId: userId,
            status: 'completed',
            escrowStatus: 'held',
        }).catch(() => []);
        let actualEscrowBalance = 0;
        if (Array.isArray(escrowPayments)) {
            for (const payment of escrowPayments) {
                actualEscrowBalance += payment?.netAmount || 0;
            }
        }
        // Update wallet with correct values
        if (wallet) {
            wallet.escrowBalance = actualEscrowBalance;
            wallet.availableBalance = (wallet.balance || 0) - wallet.escrowBalance;
            await wallet.save();
        }
        return res.status(200).json({
            success: true,
            data: {
                ...(wallet ? wallet.toObject() : { balance: 0, escrowBalance: 0, availableBalance: 0 }),
                pendingPayments: pendingAmount || 0,
                ongoingProjects: ongoingProjects?.length || 0,
                projects: ongoingProjects || [],
            },
        });
    }
    catch (error) {
        console.error('Get wallet balance error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch wallet balance',
        });
    }
};
exports.getWalletBalance = getWalletBalance;
/**
 * Request withdrawal
 */
const requestWithdrawal = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.user?.userId;
        const { amount, bankDetails } = req.body;
        if (!amount || !bankDetails) {
            return res.status(400).json({
                success: false,
                message: 'Amount and bank details are required',
            });
        }
        // Get wallet
        const wallet = await Wallet_model_1.default.findOne({ userId });
        if (!wallet) {
            return res.status(404).json({ success: false, message: 'Wallet not found' });
        }
        // Check available balance
        if (wallet.availableBalance < amount) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance',
            });
        }
        // Calculate processing fee (e.g., 1% or fixed amount)
        const processingFee = Math.max(100, amount * 0.01); // Min 100 NGN or 1%
        const netAmount = amount - processingFee;
        // Create withdrawal request
        const withdrawal = new Withdrawal_model_1.default({
            userId,
            amount,
            currency: wallet.currency,
            bankDetails,
            processingFee,
            netAmount,
            status: 'pending',
        });
        await withdrawal.save();
        // Deduct from available balance
        wallet.balance -= amount;
        await wallet.save();
        return res.status(200).json({
            success: true,
            message: 'Withdrawal request submitted successfully',
            data: withdrawal,
        });
    }
    catch (error) {
        console.error('Request withdrawal error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to request withdrawal',
        });
    }
};
exports.requestWithdrawal = requestWithdrawal;
/**
 * Process withdrawal (Admin only)
 */
const processWithdrawal = async (req, res) => {
    try {
        const { withdrawalId } = req.params;
        const userId = req.user?.id || req.user?._id || req.user?.userId;
        const withdrawal = await Withdrawal_model_1.default.findById(withdrawalId);
        if (!withdrawal) {
            return res.status(404).json({ success: false, message: 'Withdrawal not found' });
        }
        if (withdrawal.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Withdrawal already processed',
            });
        }
        // Update status
        withdrawal.status = 'processing';
        withdrawal.approvedBy = userId;
        withdrawal.approvedAt = new Date();
        withdrawal.processedAt = new Date();
        await withdrawal.save();
        // Initiate Paystack transfer
        try {
            // Create recipient
            const recipient = await paystack_service_1.default.createTransferRecipient(withdrawal.bankDetails.accountNumber, withdrawal.bankDetails.bankCode, withdrawal.bankDetails.accountName);
            // Initiate transfer
            const transfer = await paystack_service_1.default.initiateTransfer(recipient.data.recipient_code, withdrawal.netAmount, withdrawal._id.toString(), 'Withdrawal from Connecta');
            withdrawal.gatewayReference = transfer.data.reference;
            withdrawal.transferCode = transfer.data.transfer_code;
            withdrawal.gatewayResponse = transfer.data;
            withdrawal.status = 'completed';
            withdrawal.completedAt = new Date();
            await withdrawal.save();
            // Create transaction
            await Transaction_model_1.default.create({
                userId: withdrawal.userId,
                type: 'withdrawal',
                amount: -withdrawal.amount,
                currency: withdrawal.currency,
                status: 'completed',
                gatewayReference: transfer.data.reference,
                description: 'Withdrawal to bank account',
            });
            return res.status(200).json({
                success: true,
                message: 'Withdrawal processed successfully',
                data: withdrawal,
            });
        }
        catch (error) {
            withdrawal.status = 'failed';
            withdrawal.failureReason = error.message;
            await withdrawal.save();
            // Refund to wallet
            const wallet = await Wallet_model_1.default.findOne({ userId: withdrawal.userId });
            if (wallet) {
                wallet.balance += withdrawal.amount;
                await wallet.save();
            }
            throw error;
        }
    }
    catch (error) {
        console.error('Process withdrawal error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to process withdrawal',
        });
    }
};
exports.processWithdrawal = processWithdrawal;
/**
 * Get transaction history
 */
const getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.user?.userId;
        const { page = 1, limit = 20, type } = req.query;
        const query = { userId };
        if (type)
            query.type = type;
        const transactions = await Transaction_model_1.default.find(query)
            .populate('projectId', 'title')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const total = await Transaction_model_1.default.countDocuments(query);
        return res.status(200).json({
            success: true,
            data: transactions,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error('Get transaction history error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch transaction history',
        });
    }
};
exports.getTransactionHistory = getTransactionHistory;
/**
 * Get list of banks
 */
const getBanks = async (req, res) => {
    try {
        const banks = await paystack_service_1.default.listBanks();
        return res.status(200).json({
            success: true,
            data: banks.data,
        });
    }
    catch (error) {
        console.error('Get banks error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch banks',
        });
    }
};
exports.getBanks = getBanks;
/**
 * Resolve bank account
 */
const resolveAccount = async (req, res) => {
    try {
        const { accountNumber, bankCode } = req.body;
        if (!accountNumber || !bankCode) {
            return res.status(400).json({
                success: false,
                message: 'Account number and bank code are required',
            });
        }
        const account = await paystack_service_1.default.resolveAccountNumber(accountNumber, bankCode);
        return res.status(200).json({
            success: true,
            data: account.data,
        });
    }
    catch (error) {
        console.error('Resolve account error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to resolve account',
        });
    }
};
exports.resolveAccount = resolveAccount;
/**
 * Get all payments (Admin only)
 */
const getAllPayments = async (req, res) => {
    try {
        const { status, page = 1, limit = 100 } = req.query;
        const query = {};
        if (status) {
            query.status = status;
        }
        const payments = await Payment_model_1.default.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .populate('payerId', 'firstName lastName email profileImage')
            .populate('payeeId', 'firstName lastName email profileImage')
            .populate('projectId', 'title description');
        const total = await Payment_model_1.default.countDocuments(query);
        return res.status(200).json({
            success: true,
            data: payments,
            count: payments.length,
            total,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error('Get all payments error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch payments',
        });
    }
};
exports.getAllPayments = getAllPayments;
