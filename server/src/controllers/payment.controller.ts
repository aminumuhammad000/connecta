import { Request, Response } from 'express';
import Payment from '../models/Payment.model';
import Transaction from '../models/Transaction.model';
import Wallet from '../models/Wallet.model';
import Withdrawal from '../models/Withdrawal.model';
import Project from '../models/Project.model';
import Job from '../models/Job.model';
import User from '../models/user.model';
import flutterwaveService from '../services/flutterwave.service';
import paystackService from '../services/paystack.service';

// Platform fee percentage (e.g., 10%)
const PLATFORM_FEE_PERCENTAGE = 10;

/**
 * Initialize job verification payment
 */
export const initializeJobVerification = async (req: Request, res: Response) => {
  try {
    const { jobId, amount, description } = req.body;
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;

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
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.clientId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized for this job' });
    }

    // Create payment record for job verification
    const payment = new Payment({
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

    // Initialize Flutterwave payment
    // Fetch full user details to ensure we have email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('Initializing Flutterwave payment for:', user.email, 'Amount:', amount, 'Ref:', payment._id.toString());

    const flutterwaveResponse = await flutterwaveService.initializePayment(
      user.email,
      amount,
      payment._id.toString(), // Use payment ID as tx_ref
      { jobId, userId, type: 'job_verification' }
    );

    // Update payment with gateway reference (using tx_ref which is paymentId)
    payment.gatewayReference = payment._id.toString();
    await payment.save();

    return res.status(200).json({
      success: true,
      message: 'Job verification payment initialized',
      data: {
        paymentId: payment._id,
        authorizationUrl: flutterwaveResponse.data.link,
        reference: payment._id.toString(),
      },
    });
  } catch (error: any) {
    console.error('Job verification payment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to initialize job verification payment',
    });
  }
};

/**
 * Initialize payment for a project/milestone
 */
export const initializePayment = async (req: Request, res: Response) => {
  try {
    const { projectId, milestoneId, amount, payeeId, description } = req.body;
    const payerId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;

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
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Calculate platform fee
    const platformFee = (amount * PLATFORM_FEE_PERCENTAGE) / 100;
    const netAmount = amount - platformFee;

    // Check if there's already a pending payment for this project
    let payment = await Payment.findOne({
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
    } else {
      // Create new payment record
      payment = new Payment({
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

    // Initialize Flutterwave payment
    const user = (req as any).user;
    const flutterwaveResponse = await flutterwaveService.initializePayment(
      user.email,
      amount,
      payment._id.toString(),
      {
        projectId,
        milestoneId,
        payerId,
        payeeId,
      }
    );

    // Update payment with gateway reference
    payment.gatewayReference = payment._id.toString();
    await payment.save();

    return res.status(200).json({
      success: true,
      message: 'Payment initialized successfully',
      data: {
        paymentId: payment._id,
        authorizationUrl: flutterwaveResponse.data.link,
        reference: payment._id.toString(),
      },
    });
  } catch (error: any) {
    console.error('Initialize payment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to initialize payment',
    });
  }
};

/**
 * Verify payment after Flutterwave callback
 */
// Removed missing service import

/**
 * Verify payment after Flutterwave callback
 */
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({ success: false, message: 'Reference is required' });
    }

    const transactionId = req.query.transaction_id as string;
    if (!transactionId) {
      return res.status(400).json({ success: false, message: 'Transaction ID is required' });
    }

    // Verify with Flutterwave
    const flwResponse = await flutterwaveService.verifyPayment(transactionId);

    if (flwResponse.status !== 'success' || flwResponse.data.status !== 'successful') {
      return res.status(400).json({ success: false, message: 'Payment verification failed at gateway' });
    }

    // Find local payment record
    // The reference passed in params was set to payment._id during initialization
    const payment = await Payment.findById(reference);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    // Verify amount (allow small diff for floating point?)
    if (payment.amount > flwResponse.data.amount) {
      return res.status(400).json({ success: false, message: 'Payment amount mismatch' });
    }

    // Update Payment
    payment.status = 'completed';
    payment.gatewayResponse = flwResponse.data;
    payment.paidAt = new Date();
    await payment.save();

    // Handle Job Verification
    if (payment.paymentType === 'job_verification' && payment.jobId) {
      const job = await Job.findById(payment.jobId);
      if (job) {
        job.paymentVerified = true;
        job.paymentStatus = 'escrow'; // Or released/verified depending on flow
        await job.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: payment,
    });
  } catch (error: any) {
    console.error('Verify payment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify payment',
    });
  }
};

/**
 * Release payment from escrow (after work approval)
 */
export const releasePayment = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;

    const payment = await Payment.findById(paymentId);
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
    const freelancerWallet = await Wallet.findOne({ userId: payment.payeeId });
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
  } catch (error: any) {
    console.error('Release payment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to release payment',
    });
  }
};

/**
 * Request refund
 */
export const refundPayment = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;

    const payment = await Payment.findById(paymentId);
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
    const freelancerWallet = await Wallet.findOne({ userId: payment.payeeId });
    if (freelancerWallet) {
      freelancerWallet.escrowBalance -= payment.netAmount;
      freelancerWallet.balance -= payment.netAmount;
      await freelancerWallet.save();
    }

    // Create refund transaction
    await Transaction.create({
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
  } catch (error: any) {
    console.error('Refund payment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to refund payment',
    });
  }
};

/**
 * Get payment history
 */
export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    const { page = 1, limit = 20, status, type } = req.query;

    const query: any = {
      $or: [{ payerId: userId }, { payeeId: userId }],
    };

    if (status) query.status = status;
    if (type) query.paymentType = type;

    const payments = await Payment.find(query)
      .populate('payerId', 'firstName lastName email')
      .populate('payeeId', 'firstName lastName email')
      .populate('projectId', 'title')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Payment.countDocuments(query);

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
  } catch (error: any) {
    console.error('Get payment history error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch payment history',
    });
  }
};

/**
 * Get wallet balance with project data
 */
export const getWalletBalance = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;

    // Check if userId exists
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - User ID not found',
      });
    }

    // Get or create wallet
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ userId });
      await wallet.save();
    }

    // Fetch ongoing projects for freelancer
    const ongoingProjects = await Project.find({
      freelancerId: userId,
      status: 'ongoing',
    }).select('title budget status clientName');

    // Fetch payments related to user's projects
    const payments = await Payment.find({
      payeeId: userId,
      status: 'completed',
    }).populate('projectId', 'title').catch(() => []);

    // Calculate pending payments (projects without completed payments)
    let pendingAmount = 0;
    for (const project of ongoingProjects) {
      if (!project || !project._id) continue;

      const hasPayment = payments.some((p) => {
        if (!p || !p.projectId) return false;
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
    const escrowPayments = await Payment.find({
      payeeId: userId,
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
  } catch (error: any) {
    console.error('Get wallet balance error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch wallet balance',
    });
  }
};

/**
 * Request withdrawal
 */
export const requestWithdrawal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    const { amount, bankDetails } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Withdrawal amount is required',
      });
    }

    // Get wallet
    // We need to check if wallet exists and has balance
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }

    // Determine Bank Details to use
    // Prioritize request body, fallback to saved wallet settings
    let withdrawalBankDetails = bankDetails;

    // Validating if bankDetails from body is empty, we check wallet
    if (!withdrawalBankDetails || !withdrawalBankDetails.accountNumber) {
      if (wallet.bankDetails && wallet.bankDetails.accountNumber) {
        withdrawalBankDetails = wallet.bankDetails;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Bank details are required. Please provide them or save them in settings.',
        });
      }
    }

    // Check available balance
    if (wallet.availableBalance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient available balance',
      });
    }

    // Calculate processing fee (e.g., 100 NGN or 1.5%) - Lets stick to simple flat fee for now or percentage
    // Standard Flutterwave transfer fee is usually around 10-50 NGN depending on amount, but platform can charge more.
    const processingFee = amount < 5000 ? 10 : 50;
    const netAmount = amount - processingFee;

    // Create withdrawal request
    const withdrawal = new Withdrawal({
      userId,
      amount,
      currency: wallet.currency,
      bankDetails: withdrawalBankDetails,
      processingFee,
      netAmount,
      status: 'pending',
    });

    await withdrawal.save();

    // Deduct from wallet balance IMMEDIATELY to prevent double spend
    wallet.balance -= amount;
    // Pre-save hook will update availableBalance
    await wallet.save();

    return res.status(200).json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      data: withdrawal,
    });
  } catch (error: any) {
    console.error('Request withdrawal error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to request withdrawal',
    });
  }
};



/**
 * Get pending withdrawals (Admin only)
 */
export const getPendingWithdrawals = async (req: Request, res: Response) => {
  try {
    const withdrawals = await Withdrawal.find({ status: { $in: ['pending', 'processing'] } })
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName email'); // Ensure User model is populated

    return res.status(200).json({
      success: true,
      count: withdrawals.length,
      data: withdrawals,
    });
  } catch (error: any) {
    console.error('Get pending withdrawals error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch pending withdrawals',
    });
  }
};

/**
 * Get all withdrawals (Admin only)
 */
export const getAllWithdrawals = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 100 } = req.query;
    const query: any = {};
    if (status) query.status = status;

    const withdrawals = await Withdrawal.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('userId', 'firstName lastName email profileImage');

    const total = await Withdrawal.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: withdrawals,
      total,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get all withdrawals error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch withdrawals',
    });
  }
};

/**
 * Process withdrawal (Admin only)
 */
export const processWithdrawal = async (req: Request, res: Response) => {
  try {
    const { withdrawalId } = req.params;
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;

    const withdrawal = await Withdrawal.findById(withdrawalId);
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

    // Initiate Flutterwave transfer
    try {
      // Initiate transfer directly (Flutterwave doesn't need separate recipient creation for simple transfers usually, or we use the bank code/account number directly)
      const transfer = await flutterwaveService.initiateTransfer(
        withdrawal.bankDetails.bankCode,
        withdrawal.bankDetails.accountNumber,
        withdrawal.netAmount,
        'Withdrawal from Connecta',
        withdrawal._id.toString()
      );

      withdrawal.gatewayReference = transfer.data.id.toString(); // Flutterwave returns numeric ID
      withdrawal.transferCode = transfer.data.id.toString(); // Use ID as code
      withdrawal.gatewayResponse = transfer.data;

      // Flutterwave transfers are often async, status might be "NEW" or "SUCCESSFUL"
      if (transfer.status === 'success' && transfer.data.status === 'SUCCESSFUL') {
        withdrawal.status = 'completed';
        withdrawal.completedAt = new Date();
      } else {
        // Keep as processing if pending
        withdrawal.status = 'processing';
      }

      await withdrawal.save();

      // Create transaction
      await Transaction.create({
        userId: withdrawal.userId,
        type: 'withdrawal',
        amount: -withdrawal.amount,
        currency: withdrawal.currency,
        status: withdrawal.status === 'completed' ? 'completed' : 'pending',
        gatewayReference: transfer.data.id.toString(),
        description: 'Withdrawal to bank account',
      });

      // Send email notification
      try {
        const User = require('../models/user.model').default;
        const user = await User.findById(withdrawal.userId);
        if (user && user.email) {
          const emailService = require('../services/email.service');
          await emailService.sendEmail(
            user.email,
            'Withdrawal Processed',
            `<p>Hi ${user.firstName},</p><p>Your withdrawal of <strong>${withdrawal.currency} ${withdrawal.amount}</strong> has been successfully processed and sent to your bank account.</p>`,
            `Your withdrawal of ${withdrawal.currency} ${withdrawal.amount} has been processed.`
          );
        }
      } catch (e) {
        console.error('Failed to send withdrawal email', e);
      }

      return res.status(200).json({
        success: true,
        message: 'Withdrawal processed successfully',
        data: withdrawal,
      });
    } catch (error: any) {
      console.error('Flutterwave transfer error:', error);
      withdrawal.status = 'failed';
      withdrawal.failureReason = error.message;
      await withdrawal.save();

      // Refund to wallet
      const wallet = await Wallet.findOne({ userId: withdrawal.userId });
      if (wallet) {
        wallet.balance += withdrawal.amount;
        wallet.availableBalance = (wallet.balance || 0) - (wallet.escrowBalance || 0); // Re-calc available
        await wallet.save();
      }

      throw error;
    }
  } catch (error: any) {
    console.error('Process withdrawal error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process withdrawal',
    });
  }
};

/**
 * Get transaction history
 */
export const getTransactionHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    const { page = 1, limit = 20, type } = req.query;

    const query: any = { userId };
    if (type) query.type = type;

    const transactions = await Transaction.find(query)
      .populate('projectId', 'title')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Transaction.countDocuments(query);

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
  } catch (error: any) {
    console.error('Get transaction history error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch transaction history',
    });
  }
};

/**
 * Get list of banks
 */
/**
 * Get list of banks
 */
export const getBanks = async (req: Request, res: Response) => {
  try {
    const banks = await flutterwaveService.listBanks();
    return res.status(200).json({
      success: true,
      data: banks.data,
    });
  } catch (error: any) {
    console.error('Get banks error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch banks',
    });
  }
};

/**
 * Resolve bank account
 */
export const resolveAccount = async (req: Request, res: Response) => {
  try {
    const { accountNumber, bankCode } = req.body;

    if (!accountNumber || !bankCode) {
      return res.status(400).json({
        success: false,
        message: 'Account number and bank code are required',
      });
    }

    const account = await flutterwaveService.resolveAccount(accountNumber, bankCode);

    return res.status(200).json({
      success: true,
      data: account.data,
    });
  } catch (error: any) {
    console.error('Resolve account error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to resolve account',
    });
  }
};

/**
 * Get all payments (Admin only)
 */
export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 100 } = req.query;

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const { userId } = req.query;
    if (userId) {
      query.$or = [
        { payerId: userId },
        { payeeId: userId }
      ];
    }

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('payerId', 'firstName lastName email profileImage')
      .populate('payeeId', 'firstName lastName email profileImage')
      .populate('projectId', 'title description');

    const total = await Payment.countDocuments(query);

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
  } catch (error: any) {
    console.error('Get all payments error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch payments',
    });
  }
};

/**
 * Save withdrawal settings (bank details)
 */
export const saveWithdrawalSettings = async (req: Request, res: Response) => {
  try {
    const { accountName, accountNumber, bankName, bankCode } = req.body;
    const userId = (req as any).user?._id || (req as any).user?.id || (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!accountName || !accountNumber || !bankName || !bankCode) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: accountName, accountNumber, bankName, bankCode',
      });
    }

    // Find user's wallet
    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      // Create wallet if it doesn't exist
      wallet = new Wallet({
        userId,
        balance: 0,
        currency: 'NGN', // Default to NGN
      });
    }

    // Update bank details
    wallet.bankDetails = {
      accountName,
      accountNumber,
      bankName,
      bankCode,
    };
    wallet.isVerified = true; // Assume verified if they provided details (for now)

    await wallet.save();

    return res.status(200).json({
      success: true,
      message: 'Withdrawal settings saved successfully',
      data: wallet.bankDetails,
    });
  } catch (error: any) {
    console.error('Save withdrawal settings error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to save withdrawal settings',
    });
  }
};

/**
 * Get all wallets (Admin only)
 */
export const getAllWallets = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 100 } = req.query;

    const wallets = await Wallet.find()
      .sort({ updatedAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('userId', 'firstName lastName email profileImage');

    const total = await Wallet.countDocuments();

    return res.status(200).json({
      success: true,
      data: wallets,
      total,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get all wallets error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch wallets',
    });
  }
};
