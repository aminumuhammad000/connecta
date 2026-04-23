import { Request, Response } from 'express';
import Payment from '../models/Payment.model.js';
import Transaction from '../models/Transaction.model.js';
import Wallet from '../models/Wallet.model.js';
import Withdrawal from '../models/Withdrawal.model.js';
import Project from '../models/Project.model.js';
import User from '../models/user.model.js';
import { createNotification } from './notification.controller.js';
import { Job } from '../models/Job.model.js';
import mongoose from 'mongoose';
import crypto from 'crypto';
import vtstackService from '../services/vtstack.service.js';

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
 * Initialize payment for a top-up (wallet deposit)
 */
export const initializeTopup = async (req: Request, res: Response) => {
  try {
    console.log('🔵 [debug] Received Topup Initialization request');
    const { amount, description } = req.body;
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: amount',
      });
    }

    // Create payment record for top-up
    const payment = new Payment({
      payerId: userId,
      payeeId: userId, // Top-up is to self
      amount,
      platformFee: 0, // No platform fee for top-ups usually
      netAmount: amount,
      currency: 'NGN',
      paymentType: 'topup',
      description: description || 'Wallet Top-up',
      status: 'pending',
      escrowStatus: 'none',
    });

    await payment.save();

    // Initialize Flutterwave payment
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const flutterwaveResponse = await flutterwaveService.initializePayment(
      user.email,
      amount,
      payment._id.toString(),
      { type: 'topup', userId }
    );

    payment.gatewayReference = payment._id.toString();
    await payment.save();

    return res.status(200).json({
      success: true,
      message: 'Top-up initialized successfully',
      data: {
        paymentId: payment._id,
        authorizationUrl: flutterwaveResponse.data.link,
        reference: payment._id.toString(),
      },
    });
  } catch (error: any) {
    console.error('Initialize topup error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to initialize top-up',
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

    let project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    let projectTitle = project.title;

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
      payment.description = description || `Payment for ${projectTitle}`;
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
        description: description || `Payment for ${projectTitle}`,
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

          // Notify Matched Freelancers
          try {
            const { notifyMatchedFreelancers } = await import('./notification.controller.js');
            await notifyMatchedFreelancers(job);
          } catch (err) {
            console.error('Failed to notify matched freelancers:', err);
          }
        }
    }

    // Handle Wallet Top-up
    if (payment.paymentType === 'topup') {
      let wallet = await Wallet.findOne({ userId: payment.payerId });
      if (!wallet) {
        wallet = new Wallet({ userId: payment.payerId });
      }
      wallet.balance = (wallet.balance || 0) + payment.amount;
      wallet.availableBalance = (wallet.availableBalance || 0) + payment.amount;
      await wallet.save();

      // Create a credit transaction
      await Transaction.create({
        userId: payment.payerId,
        type: 'deposit',
        amount: payment.amount,
        currency: payment.currency,
        status: 'completed',
        paymentId: payment._id,
        description: payment.description || 'Wallet Top-up',
      });

      // Notify User
      await createNotification({
        userId: payment.payerId,
        type: 'payment_received',
        title: '💰 Wallet Funded',
        message: `Your wallet has been credited with ₦${payment.amount.toLocaleString()}`,
        relatedId: payment._id,
        relatedType: 'payment',
        priority: 'high',
      });
    }

    // Handle Project Payment (Milestone or Full)
    if (payment.paymentType === 'milestone' || payment.paymentType === 'full_payment') {
      // 1. Credit the freelancer's wallet (escrow balance)
      let freelancerWallet = await Wallet.findOne({ userId: payment.payeeId });
      if (!freelancerWallet) {
        freelancerWallet = new Wallet({ userId: payment.payeeId });
      }

      // Add to balance and escrow
      freelancerWallet.balance = (freelancerWallet.balance || 0) + payment.netAmount;
      freelancerWallet.escrowBalance = (freelancerWallet.escrowBalance || 0) + payment.netAmount;
      payment.escrowStatus = 'held';
      await payment.save();
      await freelancerWallet.save();

      // 2. Create a transaction record for the freelancer
      await Transaction.create({
        userId: payment.payeeId,
        type: 'payment_received',
        amount: payment.netAmount,
        currency: payment.currency,
        status: 'pending', // pending = locked in escrow until released
        paymentId: payment._id,
        projectId: payment.projectId,
        description: `🔒 Escrow payment for project: ${payment.description}`,
      });
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
 * Pay for a job or verification from wallet balance
 */
export const payFromWallet = async (req: Request, res: Response) => {
  try {
    const { type, jobId, projectId, amount, payeeId, description } = req.body;
    const payerId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;

    if (!payerId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // 1. Check Payer Wallet
    const payerWallet = await Wallet.findOne({ userId: payerId });
    if (!payerWallet || payerWallet.availableBalance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient available balance. Please fund your wallet using your virtual account.',
      });
    }

    // 2. Handle Verification/Posting Fee Payment
    if (type === 'job_verification' && jobId) {
      const job = await Job.findById(jobId);
      if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
      
      const SystemSettings = (await import('../models/SystemSettings.model.js')).default;
      const settings = await SystemSettings.getSettings();
      const fee = settings.payments?.jobPostingFee || 0;

      // Ensure amount matches fee (optional but good)
      if (amount < fee) {
          return res.status(400).json({ success: false, message: `Insufficient amount. Job posting fee is ₦${fee.toLocaleString()}` });
      }

      // Deduct from client
      payerWallet.balance -= amount;
      payerWallet.totalSpent += amount;
      await payerWallet.save();

      // Activate Job
      job.status = 'active';
      job.paymentVerified = true;
      job.paymentStatus = 'escrow';
      await job.save();

      // Notify Matched Freelancers
      try {
          const { notifyMatchedFreelancers } = await import('./notification.controller.js');
          await notifyMatchedFreelancers(job);
      } catch (err) {
          console.error('Failed to notify matched freelancers:', err);
      }

      // Create Payment Record
      const payment = new Payment({
        jobId,
        payerId,
        payeeId: payerId,
        amount,
        platformFee: amount, // Fee goes to platform
        netAmount: 0,
        currency: 'NGN',
        paymentType: 'job_verification',
        description: description || `Job posting fee for: ${job.title}`,
        status: 'completed',
        paymentMethod: 'bank_transfer', 
        paidAt: new Date(),
        escrowStatus: 'none',
      });
      await payment.save();

      // Update Job
      job.paymentVerified = true;
      job.paymentStatus = 'verified';
      await job.save();

      // Transaction Record
      await Transaction.create({
        userId: payerId,
        type: 'payment_sent',
        amount,
        currency: 'NGN',
        status: 'completed',
        paymentId: payment._id,
        description: payment.description,
      });

      return res.status(200).json({ success: true, message: 'Job verified using wallet balance', data: payment });
    }

    // 3. Handle Project Payment (Hiring/Milestone)
    if ((type === 'milestone' || type === 'full_payment') && projectId && payeeId) {
      const platformFee = (amount * PLATFORM_FEE_PERCENTAGE) / 100;
      const netAmount = amount - platformFee;

      // Deduct from Client
      payerWallet.balance -= amount;
      payerWallet.totalSpent += amount;
      await payerWallet.save();

      // Credit Freelancer (Escrow)
      let freelancerWallet = await Wallet.findOne({ userId: payeeId });
      if (!freelancerWallet) {
        freelancerWallet = new Wallet({ userId: payeeId });
      }
      freelancerWallet.balance += netAmount;
      freelancerWallet.escrowBalance += netAmount;
      await freelancerWallet.save();

      // Create Payment Record
      const payment = new Payment({
        projectId,
        payerId,
        payeeId,
        amount,
        platformFee,
        netAmount,
        currency: 'NGN',
        paymentType: type,
        description: description || 'Project payment from wallet',
        status: 'completed',
        paymentMethod: 'bank_transfer',
        paidAt: new Date(),
        escrowStatus: 'held',
      });
      await payment.save();

      // Transaction Records
      // 1. Client Debit
      await Transaction.create({
        userId: payerId,
        type: 'payment_sent',
        amount,
        currency: 'NGN',
        status: 'completed',
        paymentId: payment._id,
        projectId,
        description: `Payment for project (Escrowed)`,
      });
      // 2. Freelancer Credit (Escrow — locked until released)
      await Transaction.create({
        userId: payeeId,
        type: 'payment_received',
        amount: netAmount,
        currency: 'NGN',
        status: 'pending',
        paymentId: payment._id,
        projectId,
        description: `🔒 Incoming escrow payment`,
      });

      // Notify Freelancer
      await createNotification({
        userId: payeeId,
        type: 'payment_received',
        title: '🔒 Payment Locked in Escrow',
        message: `₦${netAmount.toLocaleString()} has been escrowed for project: ${description || 'New Project'}. Funds will be available once work is completed.`,
        relatedId: payment._id,
        relatedType: 'payment',
        priority: 'high',
      });

      return res.status(200).json({ success: true, message: 'Payment successful. Funds held in escrow.', data: payment });
    }

    return res.status(400).json({ success: false, message: 'Invalid payment request' });
  } catch (error: any) {
    console.error('Pay from wallet error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to process wallet payment' });
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

      // Notify Freelancer
      await createNotification({
        userId: payment.payeeId,
        type: 'payment_received',
        title: '💸 Payment Released',
        message: `₦${payment.netAmount.toLocaleString()} has been moved from escrow to your available balance.`,
        relatedId: payment._id,
        relatedType: 'payment',
        actorId: userId,
        actorName: 'Client',
        priority: 'high',
      });
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
      wallet.escrowBalance = Math.max(0, actualEscrowBalance);
      wallet.balance = Math.max(0, wallet.balance || 0);
      wallet.availableBalance = Math.max(0, (wallet.balance || 0) - wallet.escrowBalance);
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
    const banks = await vtstackService.listBanks();
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

    const account = await vtstackService.resolveAccount(accountNumber, bankCode);

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
/**
 * Get or create a VTStack virtual account for the current user
 */
export const getOrCreateVirtualAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ userId });
      await wallet.save();
    }

    // If already exists, return it
    if (wallet.vtstackVirtualAccount && wallet.vtstackVirtualAccount.accountNumber) {
      return res.status(200).json({
        success: true,
        data: wallet.vtstackVirtualAccount
      });
    }

    // Get user details for account creation
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Use phone number or random 11-digit for BVN fallback
    // Must start with '22' as per documentation requirement
    let bvnToUse = user.phoneNumber ? user.phoneNumber.replace(/[^0-9]/g, '').slice(-11) : '';
    if (bvnToUse.length !== 11 || !bvnToUse.startsWith('22')) {
      bvnToUse = '22' + Math.floor(100000000 + Math.random() * 900000000).toString();
    }

    // Create virtual account
    // Normalize phone to 11 digits (e.g. 080...)
    let phoneToUse = user.phoneNumber || '08000000000';
    phoneToUse = phoneToUse.replace(/[^0-9]/g, '');
    if (phoneToUse.startsWith('234') && phoneToUse.length > 11) {
      phoneToUse = '0' + phoneToUse.slice(3);
    }
    if (phoneToUse.length > 11) phoneToUse = phoneToUse.slice(-11);

    const vtResponse = await vtstackService.createVirtualAccount({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: phoneToUse,
      bvn: bvnToUse,
      reference: `connecta_${userId}_${Date.now()}`
    });

    if (vtResponse.success && vtResponse.data) {
      wallet.vtstackVirtualAccount = {
        id: vtResponse.data.id,
        accountNumber: vtResponse.data.accountNumber,
        accountName: vtResponse.data.accountName,
        bankName: vtResponse.data.bankName,
        status: vtResponse.data.status,
        reference: vtResponse.data.reference
      };
      await wallet.save();

      return res.status(200).json({
        success: true,
        message: 'Virtual account created successfully',
        data: wallet.vtstackVirtualAccount
      });
    }

    throw new Error(vtResponse.message || 'Failed to create virtual account');
  } catch (error: any) {
    console.error('Get/Create virtual account error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get or create virtual account'
    });
  }
};

/**
 * Handle VTStack Webhook
 */
export const handleVTStackWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-vtstack-signature'] as string;
    const secret = req.headers['x-vtstack-secret'] as string;
    
    // 1. Verify Secret (Basic check)
    if (secret !== process.env.VTSTACK_WEBHOOK_SECRET && process.env.NODE_ENV === 'production') {
      console.warn('Invalid VTStack Secret Header');
      // In production, we should reject. For dev, we might allow.
    }

    // 2. Verify HMAC Signature
    const hash = crypto
      .createHmac('sha256', process.env.VTSTACK_WEBHOOK_KEY || 'webhook_secret')
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== signature && process.env.NODE_ENV === 'production') {
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    const { event, data } = req.body;

    if (event === 'transaction.deposit' && data.status === 'success') {
      const { amount, virtualAccount, reference } = data;
      
      // Find wallet by virtual account number
      const wallet = await Wallet.findOne({ 'vtstackVirtualAccount.accountNumber': virtualAccount });
      
      if (wallet) {
        // Check for duplicate transaction
        const existingTx = await Transaction.findOne({ gatewayReference: reference });
        if (existingTx) {
          return res.status(200).json({ success: true, message: 'Duplicate transaction ignored' });
        }

        // Credit the wallet
        // VTStack amounts are usually in Kobo (e.g. 10000 for 100 Naira)
        // Ensure we convert to Naira for our system
        const creditAmount = amount / 100; 
        
        wallet.balance += creditAmount;
        await wallet.save();

        // Create transaction record
        await Transaction.create({
          userId: wallet.userId,
          type: 'deposit',
          amount: creditAmount,
          currency: 'NGN',
          status: 'completed',
          gateway: 'vtstack',
          gatewayReference: reference,
          description: `Virtual Account Deposit: ${reference}`
        });

        // Notify user
        await createNotification({
          userId: wallet.userId,
          type: 'payment_received',
          title: '💰 Wallet Funded via Transfer',
          message: `Your wallet has been credited with ₦${creditAmount.toLocaleString()}.`,
          priority: 'high'
        });

        console.log(`Successfully credited wallet for account ${virtualAccount} with ${creditAmount}`);
      } else {
        console.warn(`Wallet not found for virtual account: ${virtualAccount}`);
      }
    }

    // Always respond with 200 OK as per VTStack docs
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('VTStack Webhook Error:', error);
    // Still return 200 to acknowledge receipt if it's a processing error
    return res.status(200).json({ success: false, error: error.message });
  }
};

/**
 * Request a payout via VTStack Secure Payout API
 *
 * Flow:
 *  1. Validate user has sufficient available balance
 *  2. Deduct balance immediately (prevent double-spend)
 *  3. Create a Withdrawal record (status: processing)
 *  4. Call VTStack Secure Payout API with HMAC-SHA256 signature
 *  5. Create Transaction record
 *  6. Notify user
 *  7. On gateway failure: restore wallet balance & mark withdrawal failed
 */
export const requestVTStackPayout = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const { amount } = req.body; // amount in NAIRA (our system stores in Naira)

    // ── Validation ────────────────────────────────────────────────
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'A valid payout amount is required.' });
    }

    const nairaAmount = Number(amount);
    const MIN_PAYOUT = 100;    // ₦100 minimum
    const MAX_PAYOUT = 5000000; // ₦5,000,000 maximum per request

    if (nairaAmount < MIN_PAYOUT) {
      return res.status(400).json({
        success: false,
        message: `Minimum payout amount is ₦${MIN_PAYOUT.toLocaleString()}.`,
      });
    }
    if (nairaAmount > MAX_PAYOUT) {
      return res.status(400).json({
        success: false,
        message: `Maximum payout amount is ₦${MAX_PAYOUT.toLocaleString()} per request.`,
      });
    }

    // ── Wallet Check ──────────────────────────────────────────────
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found.' });
    }

    if ((wallet.availableBalance || 0) < nairaAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient available balance. You have ₦${(wallet.availableBalance || 0).toLocaleString()} available.`,
      });
    }

    // ── Bank Details ──────────────────────────────────────────────
    const bankDetails = wallet.bankDetails;
    if (!bankDetails || !bankDetails.accountNumber || !bankDetails.bankCode || !bankDetails.accountName) {
      return res.status(400).json({
        success: false,
        message: 'No bank account saved. Please set up your withdrawal bank account first.',
      });
    }

    // ── Deduct Balance Immediately (prevent double-spend) ─────────
    const balanceBefore = wallet.balance;
    wallet.balance -= nairaAmount;
    await wallet.save(); // pre-save hook updates availableBalance

    // ── Create Withdrawal Record ──────────────────────────────────
    const processingFee = nairaAmount < 5000 ? 10 : 50; // flat fee in Naira
    const netAmount = nairaAmount - processingFee;

    const withdrawal = new Withdrawal({
      userId,
      amount: nairaAmount,
      currency: wallet.currency || 'NGN',
      bankDetails: {
        accountName: bankDetails.accountName,
        accountNumber: bankDetails.accountNumber,
        bankName: bankDetails.bankName || '',
        bankCode: bankDetails.bankCode,
      },
      processingFee,
      netAmount,
      status: 'processing',
      processedAt: new Date(),
    });
    await withdrawal.save();

    // ── Call VTStack Secure Payout API ────────────────────────────
    // VTStack expects amount in KOBO (Naira × 100)
    let gatewayResponse: any;
    let payoutSucceeded = false;

    try {
      gatewayResponse = await vtstackService.securePayout({
        amount: Math.round(netAmount * 100), // convert Naira → Kobo
        bankCode: bankDetails.bankCode,
        accountNumber: bankDetails.accountNumber,
        accountName: bankDetails.accountName,
        narration: `Connecta payout – ${withdrawal._id.toString()}`,
      });

      // VTStack responses typically include a reference/status field
      withdrawal.gatewayReference = gatewayResponse?.reference || gatewayResponse?.idempotencyKey || '';
      withdrawal.gatewayResponse = gatewayResponse;
      withdrawal.transferCode = gatewayResponse?.reference || gatewayResponse?.idempotencyKey || '';

      // Mark completed if gateway confirms success immediately
      const gwStatus = (gatewayResponse?.status || '').toLowerCase();
      if (gwStatus === 'success' || gwStatus === 'successful' || gwStatus === 'pending') {
        withdrawal.status = 'completed';
        withdrawal.completedAt = new Date();
        payoutSucceeded = true;
      } else {
        // Gateway accepted but async – stay as processing
        withdrawal.status = 'processing';
        payoutSucceeded = true; // request was accepted
      }

      await withdrawal.save();
    } catch (gatewayError: any) {
      console.error('❌ [VTStack Payout] Gateway error, rolling back balance:', gatewayError.message);

      // Restore wallet balance
      wallet.balance = balanceBefore;
      await wallet.save();

      // Mark withdrawal as failed
      withdrawal.status = 'failed';
      withdrawal.failureReason = gatewayError.message || 'Gateway error';
      await withdrawal.save();

      return res.status(502).json({
        success: false,
        message: `Payout failed: ${gatewayError.message || 'Gateway error. Please try again.'}`,
      });
    }

    // ── Create Transaction Record ─────────────────────────────────
    await Transaction.create({
      userId,
      type: 'withdrawal',
      amount: nairaAmount,
      currency: wallet.currency || 'NGN',
      status: withdrawal.status === 'completed' ? 'completed' : 'pending',
      gateway: 'vtstack',
      gatewayReference: withdrawal.gatewayReference,
      balanceBefore,
      balanceAfter: wallet.balance,
      description: `Payout to ${bankDetails.accountName} (${bankDetails.accountNumber})`,
      metadata: {
        withdrawalId: withdrawal._id.toString(),
        bankCode: bankDetails.bankCode,
        processingFee,
        netAmount,
      },
    });

    // ── Notify User ───────────────────────────────────────────────
    await createNotification({
      userId,
      type: 'payment_received',
      title: '💸 Payout Initiated',
      message: `Your payout of ₦${netAmount.toLocaleString()} to ${bankDetails.accountName} (${bankDetails.bankName || bankDetails.bankCode} – ${bankDetails.accountNumber}) is being processed.`,
      relatedId: withdrawal._id,
      relatedType: 'withdrawal',
      priority: 'high',
    });

    return res.status(200).json({
      success: true,
      message: `Payout of ₦${netAmount.toLocaleString()} initiated successfully. Funds will arrive shortly.`,
      data: {
        withdrawalId: withdrawal._id,
        amount: nairaAmount,
        netAmount,
        processingFee,
        status: withdrawal.status,
        bankDetails: {
          accountName: bankDetails.accountName,
          accountNumber: bankDetails.accountNumber,
          bankName: bankDetails.bankName,
        },
        gatewayReference: withdrawal.gatewayReference,
      },
    });
  } catch (error: any) {
    console.error('requestVTStackPayout error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process payout. Please try again.',
    });
  }
};
