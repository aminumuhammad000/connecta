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

    const vtstackResponse = await vtstackService.initializePayment(
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
        authorizationUrl: (vtstackResponse.data as any).authorization_url || (vtstackResponse.data as any).link,
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

    const vtstackResponse = await vtstackService.initializePayment(
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
        authorizationUrl: (vtstackResponse.data as any).authorization_url || (vtstackResponse.data as any).link,
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
    const vtstackResponse = await vtstackService.initializePayment(
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
        authorizationUrl: (vtstackResponse.data as any).authorization_url || (vtstackResponse.data as any).link,
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

    // 1. Locate local payment record first
    let payment = mongoose.isValidObjectId(reference)
      ? await Payment.findById(reference)
      : null;

    if (!payment) {
      payment = await Payment.findOne({
        $or: [{ gatewayReference: reference }, { transactionId: reference }]
      });
    }

    // 2. Fast Idempotency Check: If already completed, return existing settlement immediately
    if (payment && payment.status === 'completed') {
      return res.status(200).json({
        success: true,
        message: 'Payment already verified and processed',
        data: payment,
      });
    }

    // 3. Verify with VTStack
    const vtResponse = await vtstackService.verifyPayment(transactionId);

    if (!vtResponse.status || vtResponse.data.status !== 'success') {
      return res.status(400).json({ success: false, message: 'Payment verification failed at gateway' });
    }

    if (!payment) {
      const verifiedRef = vtResponse.data.reference || vtResponse.data.tx_ref;
      if (verifiedRef) {
        payment = await Payment.findOne({
          $or: [
            { gatewayReference: verifiedRef },
            { transactionId: verifiedRef },
            ...(mongoose.isValidObjectId(verifiedRef) ? [{ _id: verifiedRef }] : [])
          ]
        });
      }
    }

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    // 4. Verify amount
    if (payment.amount > vtResponse.data.amount) {
      return res.status(400).json({ success: false, message: 'Payment amount mismatch' });
    }

    // 5. Atomic State Transition (guarantees single settlement execution)
    const updatedPayment = await Payment.findOneAndUpdate(
      { _id: payment._id, status: { $ne: 'completed' } },
      {
        $set: {
          status: 'completed',
          gatewayResponse: vtResponse.data,
          paidAt: new Date(),
        }
      },
      { new: true }
    );

    if (!updatedPayment) {
      // Payment was already transitioned by concurrent request
      return res.status(200).json({
        success: true,
        message: 'Payment already verified and processed',
        data: payment,
      });
    }

    payment = updatedPayment;

    // 6. Settle based on paymentType
    // Handle Job Verification
    if (payment.paymentType === 'job_verification' && payment.jobId) {
      const job = await Job.findById(payment.jobId);
      if (job) {
        job.status = 'active';
        job.paymentVerified = true;
        job.paymentStatus = 'verified';
        await job.save();

        try {
          const { notifyMatchedFreelancers } = await import('./notification.controller.js');
          await notifyMatchedFreelancers(job);
        } catch (err) {
          console.error('Failed to notify matched freelancers:', err);
        }
      }
    }

    // Handle Wallet Top-up
    if (payment.paymentType === 'topup' || payment.paymentType === 'wallet_deposit') {
      let wallet = await Wallet.findOne({ userId: payment.payerId });
      if (!wallet) {
        wallet = new Wallet({ userId: payment.payerId });
      }
      wallet.balance = (wallet.balance || 0) + payment.amount;
      wallet.availableBalance = (wallet.availableBalance || 0) + payment.amount;
      await wallet.save();

      const existingTx = await Transaction.findOne({
        paymentId: payment._id,
        type: 'deposit'
      });

      if (!existingTx) {
        await Transaction.create({
          userId: payment.payerId,
          type: 'deposit',
          amount: payment.amount,
          currency: payment.currency,
          status: 'completed',
          paymentId: payment._id,
          description: payment.description || 'Wallet Top-up',
        });
      }

      try {
        await createNotification({
          userId: payment.payerId,
          type: 'payment_received',
          title: '💰 Wallet Funded',
          message: `Your wallet has been credited with ₦${payment.amount.toLocaleString()}`,
          relatedId: payment._id,
          relatedType: 'payment',
          priority: 'high',
        });
      } catch (nErr) {
        console.error('Failed to notify wallet funded:', nErr);
      }
    }

    // Handle Project Payment (Milestone or Full)
    if (payment.paymentType === 'milestone' || payment.paymentType === 'full_payment') {
      let freelancerWallet = await Wallet.findOne({ userId: payment.payeeId });
      if (!freelancerWallet) {
        freelancerWallet = new Wallet({ userId: payment.payeeId });
      }

      freelancerWallet.balance = (freelancerWallet.balance || 0) + payment.netAmount;
      freelancerWallet.escrowBalance = (freelancerWallet.escrowBalance || 0) + payment.netAmount;
      payment.escrowStatus = 'held';
      await payment.save();
      await freelancerWallet.save();

      const existingTx = await Transaction.findOne({
        paymentId: payment._id,
        type: 'payment_received'
      });

      if (!existingTx) {
        await Transaction.create({
          userId: payment.payeeId,
          type: 'payment_received',
          amount: payment.netAmount,
          currency: payment.currency,
          status: 'pending',
          paymentId: payment._id,
          projectId: payment.projectId,
          description: `🔒 Escrow payment for project: ${payment.description}`,
        });
      }

      try {
        await createNotification({
          userId: payment.payeeId,
          type: 'payment_received',
          title: '🔒 Payment Locked in Escrow',
          message: `₦${payment.netAmount.toLocaleString()} has been escrowed for your project: ${payment.description || 'Project'}. Funds will be released upon milestone approval.`,
          relatedId: payment._id,
          relatedType: 'payment',
          priority: 'high',
          link: '/wallet',
        });

        await createNotification({
          userId: payment.payerId,
          type: 'info',
          title: '🛡️ Escrow Funded Successfully',
          message: `Your payment of ₦${payment.amount.toLocaleString()} is securely held in Connecta Escrow for: ${payment.description || 'Project'}.`,
          relatedId: payment._id,
          relatedType: 'payment',
          priority: 'high',
          link: '/client/projects',
        });
      } catch (nErr) {
        console.error('Failed to create escrow notifications:', nErr);
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
 * Pay for a job or verification from wallet balance
 */
export const payFromWallet = async (req: Request, res: Response) => {
  try {
    const { type, jobId, projectId, amount, payeeId, description } = req.body;
    const payerId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;

    if (!payerId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const payAmount = Number(amount || 0);
    if (payAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount' });
    }

    // 1. Atomic Wallet Balance Deduction (guarantees balance check and deducts in 1 atomic step)
    const updatedPayerWallet = await Wallet.findOneAndUpdate(
      { userId: payerId, balance: { $gte: payAmount } },
      { $inc: { balance: -payAmount, totalSpent: payAmount } },
      { new: true }
    );

    if (!updatedPayerWallet) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient available balance. Please fund your wallet using your virtual account.',
      });
    }

    // 2. Handle Verification/Posting Fee Payment
    if (type === 'job_verification' && jobId) {
      const job = await Job.findById(jobId);
      if (!job) {
        // Rollback balance on invalid job
        await Wallet.updateOne({ userId: payerId }, { $inc: { balance: payAmount, totalSpent: -payAmount } });
        return res.status(404).json({ success: false, message: 'Job not found' });
      }

      // Activate Job
      job.status = 'active';
      job.paymentVerified = true;
      job.paymentStatus = 'verified';
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
        amount: payAmount,
        platformFee: payAmount,
        netAmount: 0,
        currency: 'NGN',
        paymentType: 'job_verification',
        description: description || `Job posting fee for: ${job.title}`,
        status: 'completed',
        paymentMethod: 'wallet',
        paidAt: new Date(),
        escrowStatus: 'none',
      });
      await payment.save();

      // Transaction Record
      await Transaction.create({
        userId: payerId,
        type: 'payment_sent',
        amount: payAmount,
        currency: 'NGN',
        status: 'completed',
        paymentId: payment._id,
        description: payment.description,
      });

      return res.status(200).json({ success: true, message: 'Job verified using wallet balance', data: payment });
    }

    // 3. Handle Project Payment (Hiring/Milestone)
    if ((type === 'milestone' || type === 'full_payment') && projectId && payeeId) {
      const platformFee = (payAmount * PLATFORM_FEE_PERCENTAGE) / 100;
      const netAmount = payAmount - platformFee;

      // Credit Freelancer (Escrow)
      let freelancerWallet = await Wallet.findOneAndUpdate(
        { userId: payeeId },
        { $inc: { balance: netAmount, escrowBalance: netAmount } },
        { new: true, upsert: true }
      );

      // Create Payment Record
      const payment = new Payment({
        projectId,
        payerId,
        payeeId,
        amount: payAmount,
        platformFee,
        netAmount,
        currency: 'NGN',
        paymentType: type,
        description: description || 'Project payment from wallet',
        status: 'completed',
        paymentMethod: 'wallet',
        paidAt: new Date(),
        escrowStatus: 'held',
      });
      await payment.save();

      // Transaction Records
      // 1. Client Debit
      await Transaction.create({
        userId: payerId,
        type: 'payment_sent',
        amount: payAmount,
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
      try {
        await createNotification({
          userId: payeeId,
          type: 'payment_received',
          title: '🔒 Payment Locked in Escrow',
          message: `₦${netAmount.toLocaleString()} has been escrowed for project: ${description || 'New Project'}. Funds will be available once work is completed.`,
          relatedId: payment._id,
          relatedType: 'payment',
          priority: 'high',
        });
      } catch (nErr) {
        console.error('Failed to notify freelancer:', nErr);
      }

      return res.status(200).json({ success: true, message: 'Payment successful. Funds held in escrow.', data: payment });
    }

    // If unsupported type, rollback
    await Wallet.updateOne({ userId: payerId }, { $inc: { balance: payAmount, totalSpent: -payAmount } });
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

    if (!paymentId || !mongoose.isValidObjectId(paymentId)) {
      return res.status(400).json({ success: false, message: 'Invalid payment ID' });
    }

    // Atomic State Transition: ONLY release if escrowStatus is currently 'held'
    const updatedPayment = await Payment.findOneAndUpdate(
      { _id: paymentId, payerId: userId, escrowStatus: 'held' },
      {
        $set: {
          escrowStatus: 'released',
          releasedAt: new Date()
        }
      },
      { new: true }
    );

    if (!updatedPayment) {
      const existingPayment = await Payment.findById(paymentId);
      if (!existingPayment) {
        return res.status(404).json({ success: false, message: 'Payment not found' });
      }
      if (existingPayment.payerId.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized to release payment' });
      }
      return res.status(400).json({
        success: false,
        message: 'Payment is not in held escrow or has already been released/refunded',
      });
    }

    // Atomically update freelancer wallet (reduce escrow, record earnings)
    await Wallet.findOneAndUpdate(
      { userId: updatedPayment.payeeId },
      {
        $inc: {
          escrowBalance: -updatedPayment.netAmount,
          totalEarnings: updatedPayment.netAmount
        }
      },
      { upsert: true }
    );

    // Update pending freelancer escrow transactions to completed
    await Transaction.updateMany(
      { paymentId: updatedPayment._id, type: 'payment_received', status: 'pending' },
      { $set: { status: 'completed' } }
    );

    // Notify Freelancer
    try {
      await createNotification({
        userId: updatedPayment.payeeId,
        type: 'payment_received',
        title: '💸 Payment Released',
        message: `${updatedPayment.currency} ${updatedPayment.netAmount.toLocaleString()} has been moved from escrow to your available balance.`,
        relatedId: updatedPayment._id,
        relatedType: 'payment',
        actorId: userId,
        actorName: 'Client',
        priority: 'high',
      });
    } catch (nErr) {
      console.error('Failed to notify freelancer on release:', nErr);
    }

    return res.status(200).json({
      success: true,
      message: 'Payment released successfully',
      data: updatedPayment,
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

    if (!paymentId || !mongoose.isValidObjectId(paymentId)) {
      return res.status(400).json({ success: false, message: 'Invalid payment ID' });
    }

    // Atomic State Transition: ONLY refund if escrowStatus is currently 'held'
    const updatedPayment = await Payment.findOneAndUpdate(
      { _id: paymentId, payerId: userId, escrowStatus: 'held', status: { $ne: 'refunded' } },
      {
        $set: {
          status: 'refunded',
          escrowStatus: 'refunded',
          refundedAt: new Date(),
          'metadata.refundReason': reason
        }
      },
      { new: true }
    );

    if (!updatedPayment) {
      const existingPayment = await Payment.findById(paymentId);
      if (!existingPayment) {
        return res.status(404).json({ success: false, message: 'Payment not found' });
      }
      if (existingPayment.payerId.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }
      return res.status(400).json({
        success: false,
        message: 'Payment cannot be refunded or is not in held escrow',
      });
    }

    // Atomically deduct from freelancer wallet (escrow and balance)
    await Wallet.findOneAndUpdate(
      { userId: updatedPayment.payeeId },
      {
        $inc: {
          escrowBalance: -updatedPayment.netAmount,
          balance: -updatedPayment.netAmount
        }
      }
    );

    // Atomically credit payer (client) wallet
    await Wallet.findOneAndUpdate(
      { userId: updatedPayment.payerId },
      {
        $inc: {
          balance: updatedPayment.amount
        }
      },
      { upsert: true }
    );

    // Cancel pending freelancer escrow transactions
    await Transaction.updateMany(
      { paymentId: updatedPayment._id, type: 'payment_received', status: 'pending' },
      { $set: { status: 'cancelled' } }
    );

    // Create refund transaction idempotently
    const existingRefundTx = await Transaction.findOne({
      paymentId: updatedPayment._id,
      type: 'refund'
    });

    if (!existingRefundTx) {
      await Transaction.create({
        userId: updatedPayment.payerId,
        type: 'refund',
        amount: updatedPayment.amount,
        currency: updatedPayment.currency,
        status: 'completed',
        paymentId: updatedPayment._id,
        projectId: updatedPayment.projectId,
        description: `Refund for payment (${updatedPayment.currency} ${updatedPayment.amount})`,
      });
    }

    // Notify Payer
    try {
      await createNotification({
        userId: updatedPayment.payerId,
        type: 'payment_received',
        title: '💸 Payment Refunded',
        message: `Your payment of ${updatedPayment.currency} ${updatedPayment.amount.toLocaleString()} has been refunded to your wallet balance.`,
        relatedId: updatedPayment._id,
        relatedType: 'payment',
        priority: 'high',
        link: '/wallet'
      });
    } catch (nErr) {
      console.error('Failed to notify client of refund:', nErr);
    }

    return res.status(200).json({
      success: true,
      message: 'Payment refunded successfully',
      data: updatedPayment,
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

    const withdrawAmount = Number(amount || 0);
    if (withdrawAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid withdrawal amount is required',
      });
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }

    let withdrawalBankDetails = bankDetails;
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

    // 1. Atomic Wallet Balance Deduction (guarantees balance check & deducts in 1 atomic step)
    const updatedWallet = await Wallet.findOneAndUpdate(
      { userId, balance: { $gte: withdrawAmount } },
      { $inc: { balance: -withdrawAmount } },
      { new: true }
    );

    if (!updatedWallet) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient available balance',
      });
    }

    const processingFee = withdrawAmount < 5000 ? 10 : 50;
    const netAmount = withdrawAmount - processingFee;
    const reference = `WD_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create withdrawal request
    const withdrawal = new Withdrawal({
      userId,
      amount: withdrawAmount,
      currency: updatedWallet.currency || 'NGN',
      bankDetails: withdrawalBankDetails,
      processingFee,
      netAmount,
      status: 'pending',
      gatewayReference: reference,
    });

    await withdrawal.save();

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
      .populate('userId', 'firstName lastName email');

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

    if (!withdrawalId || !mongoose.isValidObjectId(withdrawalId)) {
      return res.status(400).json({ success: false, message: 'Invalid withdrawal ID' });
    }

    // Atomic State Transition: ONLY process if status is currently 'pending'
    const updatedWithdrawal = await Withdrawal.findOneAndUpdate(
      { _id: withdrawalId, status: 'pending' },
      {
        $set: {
          status: 'processing',
          approvedBy: userId,
          approvedAt: new Date(),
          processedAt: new Date(),
        }
      },
      { new: true }
    );

    if (!updatedWithdrawal) {
      return res.status(400).json({
        success: false,
        message: 'Withdrawal already processed or not in pending state',
      });
    }

    const withdrawal = updatedWithdrawal;

    // Initiate VTStack payout
    try {
      const payoutResponse = await vtstackService.securePayout({
        accountNumber: withdrawal.bankDetails.accountNumber,
        bankCode: withdrawal.bankDetails.bankCode,
        accountName: withdrawal.bankDetails.accountName,
        amount: withdrawal.netAmount * 100, // Convert to kobo
        narration: 'Withdrawal from Connecta'
      });

      withdrawal.gatewayReference = payoutResponse.reference || payoutResponse.idempotencyKey;
      withdrawal.transferCode = payoutResponse.reference || payoutResponse.idempotencyKey;
      withdrawal.gatewayResponse = payoutResponse;

      if (payoutResponse.status === 'success' || payoutResponse.status === 'processing' || payoutResponse.status === true) {
        withdrawal.status = 'completed';
        withdrawal.completedAt = new Date();
      } else {
        withdrawal.status = 'processing';
      }

      await withdrawal.save();

      // Create transaction idempotently
      const existingTx = await Transaction.findOne({
        gatewayReference: payoutResponse.reference || payoutResponse.idempotencyKey,
      });

      if (!existingTx) {
        await Transaction.create({
          userId: withdrawal.userId,
          type: 'withdrawal',
          amount: -withdrawal.amount,
          currency: withdrawal.currency,
          status: withdrawal.status === 'completed' ? 'completed' : 'pending',
          gatewayReference: payoutResponse.reference || payoutResponse.idempotencyKey,
          description: 'Withdrawal to bank account',
        });
      }

      // Send email notification
      try {
        const User = (await import('../models/user.model.js')).default;
        const user = await User.findById(withdrawal.userId);
        if (user && user.email) {
          const { sendEmail } = await import('../services/email.service.js');
          await sendEmail(
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
      console.error('Payout transfer error:', error);
      withdrawal.status = 'failed';
      withdrawal.failureReason = error.message;
      await withdrawal.save();

      // Refund to wallet atomically
      await Wallet.findOneAndUpdate(
        { userId: withdrawal.userId },
        { $inc: { balance: withdrawal.amount } }
      );

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

    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      wallet = new Wallet({
        userId,
        balance: 0,
        currency: 'NGN',
      });
    }

    wallet.bankDetails = {
      accountName,
      accountNumber,
      bankName,
      bankCode,
    };
    wallet.isVerified = true;

    await wallet.save();

    return res.status(200).json({
      success: true,
      message: 'Withdrawal settings saved successfully',
      data: wallet.bankDetails,
    });
  } catch (error: any) {
    console.error('Save withdrawal settings error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to save settings' });
  }
};

/**
 * Get payment stats for admin dashboard
 */
export const getPaymentStatsAdmin = async (req: Request, res: Response) => {
  try {
    const [completedPayments, pendingWithdrawalsData, successfulCount] = await Promise.all([
      Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Withdrawal.aggregate([
        { $match: { status: 'pending' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.countDocuments({ status: 'completed' })
    ]);

    const totalRevenue = completedPayments.length > 0 ? completedPayments[0].total : 0;
    const pendingWithdrawals = pendingWithdrawalsData.length > 0 ? pendingWithdrawalsData[0].total : 0;
    const successfulTransactions = successfulCount;

    return res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        pendingWithdrawals,
        successfulTransactions
      }
    });
  } catch (error: any) {
    console.error('Get admin payment stats error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch payment stats',
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

    if (wallet.vtstackVirtualAccount && wallet.vtstackVirtualAccount.accountNumber) {
      return res.status(200).json({
        success: true,
        data: wallet.vtstackVirtualAccount
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let bvnToUse = user.phoneNumber ? user.phoneNumber.replace(/[^0-9]/g, '').slice(-11) : '';
    if (bvnToUse.length !== 11 || !bvnToUse.startsWith('22')) {
      bvnToUse = '22' + Math.floor(100000000 + Math.random() * 900000000).toString();
    }

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

    if (secret !== process.env.VTSTACK_WEBHOOK_SECRET && process.env.NODE_ENV === 'production') {
      console.warn('Invalid VTStack Secret Header');
    }

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
        // Idempotency check: prevent duplicate credit if transaction was already processed
        const existingTx = await Transaction.findOne({ gatewayReference: reference });
        if (existingTx) {
          return res.status(200).json({ success: true, message: 'Duplicate transaction ignored' });
        }

        const creditAmount = amount / 100;

        // Atomically credit the wallet
        const updatedWallet = await Wallet.findOneAndUpdate(
          { _id: wallet._id },
          { $inc: { balance: creditAmount } },
          { new: true }
        );

        if (updatedWallet) {
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

          try {
            await createNotification({
              userId: wallet.userId,
              type: 'payment_received',
              title: '💰 Wallet Funded via Transfer',
              message: `Your wallet has been credited with ₦${creditAmount.toLocaleString()}.`,
              priority: 'high'
            });
          } catch (nErr) {
            console.error('Notification error on VTStack webhook:', nErr);
          }

          console.log(`Successfully credited wallet for account ${virtualAccount} with ${creditAmount}`);
        }
      } else {
        console.warn(`Wallet not found for virtual account: ${virtualAccount}`);
      }
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('VTStack Webhook Error:', error);
    return res.status(200).json({ success: false, error: error.message });
  }
};

/**
 * Request a payout via VTStack Secure Payout API
 */
export const requestVTStackPayout = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const { amount } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'A valid payout amount is required.' });
    }

    const nairaAmount = Number(amount);
    const MIN_PAYOUT = 100;
    const MAX_PAYOUT = 5000000;

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

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found.' });
    }

    const bankDetails = wallet.bankDetails;
    if (!bankDetails || !bankDetails.accountNumber || !bankDetails.bankCode || !bankDetails.accountName) {
      return res.status(400).json({
        success: false,
        message: 'No bank account saved. Please set up your withdrawal bank account first.',
      });
    }

    // ── Deduct Balance Immediately (prevent double-spend via atomic findOneAndUpdate) ─────────
    const updatedWallet = await Wallet.findOneAndUpdate(
      { userId, balance: { $gte: nairaAmount } },
      { $inc: { balance: -nairaAmount } },
      { new: true }
    );

    if (!updatedWallet) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient available balance.',
      });
    }

    const processingFee = nairaAmount < 5000 ? 10 : 50;
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

    let gatewayResponse: any;

    try {
      gatewayResponse = await vtstackService.securePayout({
        amount: Math.round(netAmount * 100),
        bankCode: bankDetails.bankCode,
        accountNumber: bankDetails.accountNumber,
        accountName: bankDetails.accountName,
        narration: `Connecta payout – ${withdrawal._id.toString()}`,
      });

      withdrawal.gatewayReference = gatewayResponse?.reference || gatewayResponse?.idempotencyKey || '';
      withdrawal.gatewayResponse = gatewayResponse;
      withdrawal.transferCode = gatewayResponse?.reference || gatewayResponse?.idempotencyKey || '';

      const gwStatus = (gatewayResponse?.status || '').toLowerCase();
      if (gwStatus === 'success' || gwStatus === 'successful' || gwStatus === 'pending') {
        withdrawal.status = 'completed';
        withdrawal.completedAt = new Date();
      } else {
        withdrawal.status = 'processing';
      }

      await withdrawal.save();
    } catch (gatewayError: any) {
      console.error('❌ [VTStack Payout] Gateway error, rolling back balance:', gatewayError.message);

      // Restore wallet balance atomically
      await Wallet.updateOne({ userId }, { $inc: { balance: nairaAmount } });

      withdrawal.status = 'failed';
      withdrawal.failureReason = gatewayError.message || 'Gateway error';
      await withdrawal.save();

      return res.status(502).json({
        success: false,
        message: `Payout failed: ${gatewayError.message || 'Gateway error. Please try again.'}`,
      });
    }

    // Create Transaction Record
    await Transaction.create({
      userId,
      type: 'withdrawal',
      amount: nairaAmount,
      currency: wallet.currency || 'NGN',
      status: withdrawal.status === 'completed' ? 'completed' : 'pending',
      gateway: 'vtstack',
      gatewayReference: withdrawal.gatewayReference,
      balanceBefore: updatedWallet.balance + nairaAmount,
      balanceAfter: updatedWallet.balance,
      description: `Payout to ${bankDetails.accountName} (${bankDetails.accountNumber})`,
      metadata: {
        withdrawalId: withdrawal._id.toString(),
        bankCode: bankDetails.bankCode,
        processingFee,
        netAmount,
      },
    });

    try {
      await createNotification({
        userId,
        type: 'payment_received',
        title: '💸 Payout Initiated',
        message: `Your payout of ₦${netAmount.toLocaleString()} to ${bankDetails.accountName} (${bankDetails.bankName || bankDetails.bankCode} – ${bankDetails.accountNumber}) is being processed.`,
        relatedId: withdrawal._id,
        relatedType: 'withdrawal',
        priority: 'high',
      });
    } catch (nErr) {
      console.error('Notification error on payout:', nErr);
    }

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


/**
 * Initialize Multi-Currency Flutterwave Wallet Deposit
 */
export const initializeFlutterwaveDeposit = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    const { amount, currency, redirectUrl } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const depositCurrency = (currency || user.currency || 'USD').toUpperCase();
    const depositAmount = Number(amount || 50);

    if (depositAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid deposit amount' });
    }

    const txRef = `FLW_DEP_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const finalRedirectUrl = redirectUrl || 'https://app.myconnecta.ng/wallet';

    // Create pending Payment record
    const payment = await Payment.create({
      payerId: userId,
      payeeId: userId,
      amount: depositAmount,
      netAmount: depositAmount,
      currency: depositCurrency,
      paymentType: 'wallet_deposit',
      paymentMethod: 'flutterwave',
      status: 'pending',
      escrowStatus: 'none',
      transactionId: txRef,
      gatewayReference: txRef,
      description: `Wallet deposit of ${depositCurrency} ${depositAmount}`
    });

    const flutterwaveService = (await import('../services/flutterwave.service.js')).default;
    const flwRes = await flutterwaveService.initializePayment({
      txRef,
      amount: depositAmount,
      currency: depositCurrency,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`.trim() || 'Valued User',
      phone: user.phoneNumber,
      redirectUrl: finalRedirectUrl,
      title: 'Connecta Wallet Funding',
      description: `Fund wallet in ${depositCurrency}`
    });

    res.status(200).json({
      success: true,
      message: 'Flutterwave deposit initialized',
      data: {
        paymentId: payment._id,
        link: flwRes.data?.link,
        txRef
      }
    });
  } catch (err: any) {
    console.error('initializeFlutterwaveDeposit error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error initializing Flutterwave deposit' });
  }
};

/**
 * Core Settlement Engine for Flutterwave Payments
 * Safely invoked by:
 * 1. Webhook (charge.completed)
 * 2. User Redirect Callback (verifyFlutterwavePayment)
 * 3. Background Auto-Reconciliation Cron Job (reconcilePendingFlutterwavePayments)
 */
export const settleSuccessfulFlutterwavePayment = async (
  paymentDocOrId: any,
  flwData: any,
  source: 'webhook' | 'client_verification' | 'cron_reconciliation' = 'webhook'
) => {
  let payment = typeof paymentDocOrId === 'string' || mongoose.isValidObjectId(paymentDocOrId)
    ? await Payment.findById(paymentDocOrId)
    : paymentDocOrId;

  const verifiedTxRef = flwData.tx_ref || payment?.gatewayReference || payment?.transactionId;

  if (!payment && verifiedTxRef) {
    payment = await Payment.findOne({
      $or: [
        { transactionId: verifiedTxRef },
        { gatewayReference: verifiedTxRef },
        ...(mongoose.isValidObjectId(verifiedTxRef) ? [{ _id: verifiedTxRef }] : [])
      ]
    });
  }

  if (!payment) {
    console.warn(`[Flutterwave Settlement - ${source}] Payment record not found for tx_ref: ${verifiedTxRef}`);
    return { success: false, reason: 'payment_not_found' };
  }

  // If already completed, return existing settlement immediately
  if (payment.status === 'completed') {
    const wallet = await Wallet.findOne({ userId: payment.payerId });
    return { success: true, alreadyProcessed: true, payment, wallet };
  }

  // 1. Validate Currency
  const expectedCurrency = (payment.currency || 'USD').toUpperCase();
  const paidCurrency = (flwData.currency || '').toUpperCase();
  if (paidCurrency && paidCurrency !== expectedCurrency) {
    console.warn(`[Flutterwave Settlement - ${source}] Currency mismatch for ${payment._id}: expected ${expectedCurrency}, got ${paidCurrency}`);
    payment.status = 'failed';
    payment.metadata = { ...payment.metadata, failureReason: `Currency mismatch: expected ${expectedCurrency}, got ${paidCurrency}` };
    payment.gatewayResponse = flwData;
    await payment.save();
    return { success: false, reason: 'currency_mismatch' };
  }

  // 2. Validate Amount (ensure paid amount is not less than expected amount)
  const expectedAmount = Number(payment.amount || 0);
  const paidAmount = Number(flwData.amount || flwData.charged_amount || 0);
  const tolerance = 0.01;

  if (paidAmount < (expectedAmount - tolerance)) {
    console.warn(`[Flutterwave Settlement - ${source}] Underpaid for ${payment._id}: expected ${expectedAmount}, got ${paidAmount}`);
    payment.status = 'failed';
    payment.metadata = { ...payment.metadata, failureReason: `Underpaid: expected ${expectedAmount}, received ${paidAmount}` };
    payment.gatewayResponse = flwData;
    await payment.save();
    return { success: false, reason: 'underpaid' };
  }

  // 3. Atomic State Transition (Double-spend & concurrency lock)
  const finalAmount = paidAmount > expectedAmount ? paidAmount : expectedAmount;
  const finalNetAmount = paidAmount > expectedAmount ? (paidAmount - (payment.platformFee || 0)) : payment.netAmount;

  const updatedPayment = await Payment.findOneAndUpdate(
    { _id: payment._id, status: { $ne: 'completed' } },
    {
      $set: {
        status: 'completed',
        amount: finalAmount,
        netAmount: finalNetAmount,
        paidAt: new Date(),
        gatewayResponse: flwData,
        gatewayReference: verifiedTxRef,
        transactionId: String(flwData.id || verifiedTxRef)
      }
    },
    { new: true }
  );

  if (!updatedPayment) {
    console.log(`[Flutterwave Settlement - ${source}] Payment ${payment._id} was already transitioned. Skipping duplicate execution.`);
    const wallet = await Wallet.findOne({ userId: payment.payerId });
    return { success: true, alreadyProcessed: true, payment, wallet };
  }

  payment = updatedPayment;
  let userWallet: any = null;

  // 4. Settle by Payment Type
  // A) Wallet Deposit / Top-up
  if (payment.paymentType === 'wallet_deposit' || payment.paymentType === 'topup') {
    let wallet = await Wallet.findOne({ userId: payment.payerId });
    if (!wallet) {
      wallet = new Wallet({
        userId: payment.payerId,
        balance: 0,
        escrowBalance: 0,
        currency: payment.currency
      });
    }

    const balanceBefore = Number(wallet.balance || 0);
    wallet.balance = balanceBefore + payment.amount;
    await wallet.save();
    userWallet = wallet;

    // Idempotent Transaction Record
    const existingTx = await Transaction.findOne({
      $or: [
        { gatewayReference: verifiedTxRef },
        { paymentId: payment._id }
      ]
    });

    if (!existingTx) {
      await Transaction.create({
        userId: payment.payerId,
        type: 'deposit',
        amount: payment.amount,
        currency: payment.currency,
        balanceBefore,
        balanceAfter: wallet.balance,
        gateway: 'flutterwave',
        gatewayReference: verifiedTxRef,
        status: 'completed',
        paymentId: payment._id,
        description: payment.description || `Flutterwave wallet deposit of ${payment.currency} ${payment.amount}`
      });
    }

    try {
      await createNotification({
        userId: payment.payerId,
        type: 'payment_received',
        title: '💰 Wallet Funded',
        message: `Your wallet has been credited with ${payment.currency} ${payment.amount.toLocaleString()}.`,
        relatedId: payment._id,
        relatedType: 'payment',
        priority: 'high',
        link: '/wallet'
      });
    } catch (nErr) {
      console.error(`Failed to create notification on ${source} deposit:`, nErr);
    }
  }

  // B) Job Verification Payment
  else if (payment.paymentType === 'job_verification' && payment.jobId) {
    const job = await Job.findById(payment.jobId);
    if (job) {
      job.status = 'active';
      job.paymentVerified = true;
      job.paymentStatus = 'verified';
      await job.save();

      try {
        const { notifyMatchedFreelancers } = await import('./notification.controller.js');
        await notifyMatchedFreelancers(job);
      } catch (err) {
        console.error('Failed to notify matched freelancers:', err);
      }
    }

    const existingTx = await Transaction.findOne({
      $or: [
        { gatewayReference: verifiedTxRef },
        { paymentId: payment._id }
      ]
    });

    if (!existingTx) {
      await Transaction.create({
        userId: payment.payerId,
        type: 'payment_sent',
        amount: payment.amount,
        currency: payment.currency,
        status: 'completed',
        paymentId: payment._id,
        gateway: 'flutterwave',
        gatewayReference: verifiedTxRef,
        description: payment.description || 'Job verification fee'
      });
    }

    try {
      await createNotification({
        userId: payment.payerId,
        type: 'info',
        title: '🎉 Job Verified & Active',
        message: `Your job post is now active and receiving proposals.`,
        relatedId: payment.jobId,
        relatedType: 'job',
        priority: 'high',
        link: `/jobs/${payment.jobId}`
      });
    } catch (nErr) {
      console.error(`Failed to create notification on ${source} job verification:`, nErr);
    }
  }

  // C) Milestone / Project Escrow Payment
  else if ((payment.paymentType === 'milestone' || payment.paymentType === 'full_payment' || payment.paymentType === 'project_payment') && payment.payeeId) {
    let freelancerWallet = await Wallet.findOne({ userId: payment.payeeId });
    if (!freelancerWallet) {
      freelancerWallet = new Wallet({ userId: payment.payeeId, currency: payment.currency });
    }

    freelancerWallet.balance = (freelancerWallet.balance || 0) + payment.netAmount;
    freelancerWallet.escrowBalance = (freelancerWallet.escrowBalance || 0) + payment.netAmount;
    await freelancerWallet.save();

    payment.escrowStatus = 'held';
    await payment.save();

    // Freelancer Escrow Transaction (pending locked)
    const existingTxFreelancer = await Transaction.findOne({
      userId: payment.payeeId,
      paymentId: payment._id
    });

    if (!existingTxFreelancer) {
      await Transaction.create({
        userId: payment.payeeId,
        type: 'payment_received',
        amount: payment.netAmount,
        currency: payment.currency,
        status: 'pending',
        paymentId: payment._id,
        projectId: payment.projectId,
        gateway: 'flutterwave',
        gatewayReference: verifiedTxRef,
        description: `🔒 Escrow payment for project: ${payment.description || 'Project'}`
      });
    }

    // Client Transaction (completed sent)
    const existingTxClient = await Transaction.findOne({
      userId: payment.payerId,
      paymentId: payment._id
    });

    if (!existingTxClient) {
      await Transaction.create({
        userId: payment.payerId,
        type: 'payment_sent',
        amount: payment.amount,
        currency: payment.currency,
        status: 'completed',
        paymentId: payment._id,
        projectId: payment.projectId,
        gateway: 'flutterwave',
        gatewayReference: verifiedTxRef,
        description: `Payment for project (Escrowed): ${payment.description || 'Project'}`
      });
    }

    try {
      await createNotification({
        userId: payment.payeeId,
        type: 'payment_received',
        title: '🔒 Payment Locked in Escrow',
        message: `${payment.currency} ${payment.netAmount.toLocaleString()} has been escrowed for your project: ${payment.description || 'Project'}. Funds will be released upon approval.`,
        relatedId: payment._id,
        relatedType: 'payment',
        priority: 'high',
        link: '/wallet'
      });

      await createNotification({
        userId: payment.payerId,
        type: 'info',
        title: '🛡️ Escrow Funded Successfully',
        message: `Your payment of ${payment.currency} ${payment.amount.toLocaleString()} is securely held in Connecta Escrow for: ${payment.description || 'Project'}.`,
        relatedId: payment._id,
        relatedType: 'payment',
        priority: 'high',
        link: '/client/projects'
      });
    } catch (nErr) {
      console.error(`Failed to create escrow notifications on ${source}:`, nErr);
    }
  }

  console.log(`✅ [Flutterwave Settlement - ${source}] Successfully settled ${payment.currency} ${payment.amount} for payment ${payment._id}`);
  return {
    success: true,
    alreadyProcessed: false,
    payment,
    wallet: userWallet
  };
};

/**
 * Core Settlement Engine for Flutterwave Payout Transfers / Withdrawals
 */
export const settleFlutterwaveWithdrawal = async (
  referenceOrWithdrawal: any,
  flwData: any,
  source: 'webhook' | 'cron_reconciliation' = 'webhook'
) => {
  const reference = typeof referenceOrWithdrawal === 'string' ? referenceOrWithdrawal : referenceOrWithdrawal?.gatewayReference;

  let withdrawal = typeof referenceOrWithdrawal === 'object' && referenceOrWithdrawal?._id
    ? referenceOrWithdrawal
    : await Withdrawal.findOne({
        $or: [
          { gatewayReference: reference },
          { transferCode: String(flwData.id || '') },
          ...(mongoose.isValidObjectId(reference) ? [{ _id: reference }] : [])
        ]
      });

  if (!withdrawal) {
    console.warn(`[Flutterwave Payout Settlement - ${source}] Withdrawal not found for reference: ${reference}`);
    return { success: false, reason: 'withdrawal_not_found' };
  }

  const status = (flwData.status || '').toUpperCase();

  // 1. Transfer Success
  if (status === 'SUCCESSFUL' || status === 'SUCCESS') {
    const updatedWithdrawal = await Withdrawal.findOneAndUpdate(
      { _id: withdrawal._id, status: { $in: ['pending', 'processing'] } },
      {
        $set: {
          status: 'completed',
          completedAt: new Date(),
          processedAt: new Date(),
          gatewayResponse: flwData
        }
      },
      { new: true }
    );

    if (updatedWithdrawal) {
      // Create/Update completed withdrawal transaction
      const existingTx = await Transaction.findOne({
        userId: withdrawal.userId,
        $or: [{ gatewayReference: withdrawal.gatewayReference }, { description: new RegExp(withdrawal.gatewayReference || '', 'i') }]
      });

      if (!existingTx) {
        await Transaction.create({
          userId: withdrawal.userId,
          type: 'withdrawal',
          amount: withdrawal.amount,
          currency: withdrawal.currency,
          gateway: 'flutterwave',
          gatewayReference: withdrawal.gatewayReference,
          status: 'completed',
          description: `Withdrawal to ${withdrawal.bankDetails?.accountName || 'Bank'} (${withdrawal.currency} ${withdrawal.amount})`
        });
      } else if (existingTx.status !== 'completed') {
        existingTx.status = 'completed';
        await existingTx.save();
      }

      try {
        await createNotification({
          userId: withdrawal.userId,
          type: 'info',
          title: '💸 Withdrawal Successful',
          message: `Your withdrawal of ${withdrawal.currency} ${withdrawal.amount.toLocaleString()} has been sent to your bank account.`,
          relatedId: withdrawal._id,
          relatedType: 'withdrawal',
          priority: 'high',
          link: '/wallet'
        });
      } catch (nErr) {
        console.error('Failed to notify user on withdrawal success:', nErr);
      }

      console.log(`✅ [Flutterwave Payout Settlement - ${source}] Withdrawal completed: ${withdrawal.gatewayReference}`);
    }

    return { success: true, withdrawal: updatedWithdrawal || withdrawal };
  }

  // 2. Transfer Failed or Reversed -> Refund Wallet!
  if (status === 'FAILED' || status === 'REVERSED' || status === 'CANCELLED') {
    const updatedWithdrawal = await Withdrawal.findOneAndUpdate(
      { _id: withdrawal._id, status: { $in: ['pending', 'processing'] } },
      {
        $set: {
          status: 'failed',
          failureReason: flwData.complete_message || flwData.reason || 'Transfer failed at bank gateway',
          gatewayResponse: flwData
        }
      },
      { new: true }
    );

    if (updatedWithdrawal) {
      // Refund freelancer wallet balance
      let wallet = await Wallet.findOne({ userId: withdrawal.userId });
      if (wallet) {
        wallet.balance = (wallet.balance || 0) + withdrawal.amount;
        await wallet.save();
      }

      // Record refund transaction
      await Transaction.create({
        userId: withdrawal.userId,
        type: 'refund',
        amount: withdrawal.amount,
        currency: withdrawal.currency,
        gateway: 'flutterwave',
        gatewayReference: `REFUND_${withdrawal.gatewayReference}`,
        status: 'completed',
        description: `Refund for failed withdrawal: ${withdrawal.gatewayReference}`
      });

      try {
        await createNotification({
          userId: withdrawal.userId,
          type: 'warning',
          title: '⚠️ Withdrawal Failed - Refunded',
          message: `Your withdrawal of ${withdrawal.currency} ${withdrawal.amount.toLocaleString()} could not be completed (${flwData.complete_message || 'Bank declined'}). The full amount has been refunded to your wallet balance.`,
          relatedId: withdrawal._id,
          relatedType: 'withdrawal',
          priority: 'high',
          link: '/wallet'
        });
      } catch (nErr) {
        console.error('Failed to notify user on withdrawal failure refund:', nErr);
      }

      console.log(`↩️ [Flutterwave Payout Settlement - ${source}] Withdrawal failed & refunded: ${withdrawal.gatewayReference}`);
    }

    return { success: true, refunded: true, withdrawal: updatedWithdrawal || withdrawal };
  }

  return { success: true, pending: true, withdrawal };
};

/**
 * Verify Flutterwave Payment server-side with strict validations
 */
export const verifyFlutterwavePayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    const txRef = (req.body?.txRef || req.body?.tx_ref || req.query?.txRef || req.query?.tx_ref || req.params?.txRef) as string;
    const transactionId = (req.body?.transactionId || req.body?.transaction_id || req.query?.transactionId || req.query?.transaction_id) as string;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User authentication required' });
    }

    if (!txRef && !transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Missing transaction identifier: Please provide txRef or transactionId'
      });
    }

    // 1. Locate local Payment record
    const queryConditions: any[] = [];
    if (txRef) {
      queryConditions.push({ transactionId: txRef });
      queryConditions.push({ gatewayReference: txRef });
      if (mongoose.isValidObjectId(txRef)) {
        queryConditions.push({ _id: txRef });
      }
    }
    if (transactionId) {
      queryConditions.push({ transactionId: String(transactionId) });
      queryConditions.push({ gatewayReference: String(transactionId) });
    }

    let payment = await Payment.findOne({ $or: queryConditions });

    // 2. Validate User / Transaction Mapping on local record if found
    if (payment && payment.payerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Security Violation: You are not authorized to verify this transaction'
      });
    }

    // 3. Idempotency Check: If payment is already completed, return existing settlement immediately
    if (payment && payment.status === 'completed') {
      const userWallet = await Wallet.findOne({ userId: payment.payerId });
      return res.status(200).json({
        success: true,
        message: 'Transaction already verified and processed',
        data: {
          payment,
          wallet: userWallet,
          status: 'completed'
        }
      });
    }

    // 4. Query Flutterwave API server-side
    const flutterwaveService = (await import('../services/flutterwave.service.js')).default;
    let flwResponse: any = null;

    if (transactionId) {
      try {
        flwResponse = await flutterwaveService.verifyTransaction(transactionId);
      } catch (err: any) {
        console.warn('Flutterwave verify by ID call failed, falling back if txRef exists:', err.message);
      }
    }

    if ((!flwResponse || flwResponse.status !== 'success') && txRef) {
      try {
        flwResponse = await flutterwaveService.verifyTransactionByRef(txRef);
      } catch (err: any) {
        console.warn('Flutterwave verify by reference call failed:', err.message);
      }
    }

    if (!flwResponse || flwResponse.status !== 'success' || !flwResponse.data) {
      return res.status(400).json({
        success: false,
        message: flwResponse?.message || 'Transaction could not be verified with Flutterwave gateway'
      });
    }

    const flwData = flwResponse.data;

    // 5. Validate Gateway Transaction Status
    const gatewayStatus = (flwData.status || '').toLowerCase();
    if (gatewayStatus !== 'successful') {
      if (payment) {
        payment.status = gatewayStatus === 'failed' ? 'failed' : 'pending';
        payment.gatewayResponse = flwData;
        await payment.save();
      }
      return res.status(400).json({
        success: false,
        message: `Transaction payment is not successful (status: ${gatewayStatus})`,
        data: { status: gatewayStatus }
      });
    }

    // 6. Find Payment by verified Flutterwave tx_ref if not found initially
    const verifiedTxRef = flwData.tx_ref;
    if (!payment && verifiedTxRef) {
      payment = await Payment.findOne({
        $or: [
          { transactionId: verifiedTxRef },
          { gatewayReference: verifiedTxRef },
          ...(mongoose.isValidObjectId(verifiedTxRef) ? [{ _id: verifiedTxRef }] : [])
        ]
      });
    }

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: `Payment record not found for transaction reference: ${verifiedTxRef || txRef}`
      });
    }

    // 7. Validate User / Transaction Mapping
    if (payment.payerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Security Violation: Payment does not belong to the authenticated user'
      });
    }

    // 8. Validate Transaction Reference
    const expectedRefs = [
      payment.transactionId,
      payment.gatewayReference,
      payment._id.toString()
    ].filter(Boolean);

    if (verifiedTxRef && !expectedRefs.includes(verifiedTxRef)) {
      return res.status(400).json({
        success: false,
        message: `Transaction reference mismatch: expected ${expectedRefs[0]}, got ${verifiedTxRef}`
      });
    }

    // 9. Settle via the core settlement engine
    const settlementResult = await settleSuccessfulFlutterwavePayment(payment, flwData, 'client_verification');

    if (!settlementResult.success) {
      return res.status(400).json({
        success: false,
        message: `Settlement failed: ${settlementResult.reason}`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Transaction verified successfully (${settlementResult.payment.currency} ${settlementResult.payment.amount})`,
      data: {
        payment: settlementResult.payment,
        wallet: settlementResult.wallet,
        verified: true
      }
    });
  } catch (err: any) {
    console.error('verifyFlutterwavePayment error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Error verifying Flutterwave payment'
    });
  }
};

// Export alias for backwards compatibility
export const verifyFlutterwaveDeposit = verifyFlutterwavePayment;

/**
 * Get Bank / Mobile Money Provider List by Country (NG, KE, GH, UG, ZA)
 */
export const getFlutterwaveBanks = async (req: Request, res: Response) => {
  try {
    const { country } = req.params;
    const flutterwaveService = (await import('../services/flutterwave.service.js')).default;
    const result = await flutterwaveService.getBankList(country || 'NG');
    res.status(200).json({
      success: true,
      data: result.data || []
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching bank list' });
  }
};

/**
 * Verify / Resolve Account Number via Flutterwave
 */
export const resolveFlutterwaveAccount = async (req: Request, res: Response) => {
  try {
    const { accountNumber, bankCode } = req.body;
    if (!accountNumber || !bankCode) {
      return res.status(400).json({ success: false, message: 'Account number and bank code are required' });
    }

    const flutterwaveService = (await import('../services/flutterwave.service.js')).default;
    const result = await flutterwaveService.verifyAccount(accountNumber, bankCode);
    const accountName = result.data?.account_name || result.data?.account_holder_name;

    if (accountName) {
      return res.status(200).json({
        success: true,
        data: {
          accountName,
          accountNumber: result.data?.account_number || accountNumber,
        }
      });
    }

    return res.status(400).json({
      success: false,
      message: result.message || 'Could not verify account details with selected bank'
    });
  } catch (err: any) {
    console.error('resolveFlutterwaveAccount error:', err?.message || err);
    return res.status(400).json({
      success: false,
      message: err.message || 'Failed to verify account details'
    });
  }
};

/**
 * Request Multi-Currency Flutterwave Payout Withdrawal
 */
export const requestFlutterwaveWithdrawal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const { amount, currency, bankCode, accountNumber, accountName } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const payoutCurrency = (currency || user.currency || 'USD').toUpperCase();
    const payoutAmount = Number(amount || 0);

    if (payoutAmount <= 0) {
      return res.status(400).json({ success: false, message: 'A valid withdrawal amount is required' });
    }

    // Atomic balance deduction (guarantees balance check and deducts in 1 atomic operation)
    const updatedWallet = await Wallet.findOneAndUpdate(
      { userId, balance: { $gte: payoutAmount } },
      { $inc: { balance: -payoutAmount } },
      { new: true }
    );

    if (!updatedWallet) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance for withdrawal' });
    }

    const reference = `FLW_WD_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const withdrawal = await Withdrawal.create({
      userId,
      amount: payoutAmount,
      currency: payoutCurrency,
      status: 'processing',
      gatewayReference: reference,
      bankDetails: {
        accountName,
        accountNumber,
        bankCode
      }
    });

    try {
      const flutterwaveService = (await import('../services/flutterwave.service.js')).default;
      await flutterwaveService.initiateTransfer({
        accountBank: bankCode,
        accountNumber,
        amount: payoutAmount,
        currency: payoutCurrency,
        reference,
        narration: `Connecta Wallet Payout for ${user.firstName}`
      });
    } catch (transferErr: any) {
      console.warn('Flutterwave transfer pending/failed, logged for async callback:', transferErr.message);
    }

    res.status(200).json({
      success: true,
      message: `Withdrawal of ${payoutCurrency} ${payoutAmount} initiated successfully`,
      data: withdrawal
    });
  } catch (err: any) {
    console.error('requestFlutterwaveWithdrawal error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error processing withdrawal' });
  }
};

/**
 * Handle Flutterwave Webhook Callback (Receives, Validates, and Settles all events)
 */
export const handleFlutterwaveWebhook = async (req: Request, res: Response) => {
  try {
    const signature = (
      req.headers['verif-hash'] ||
      req.headers['verif_hash'] ||
      req.headers['x-flutterwave-signature']
    ) as string;

    const flutterwaveService = (await import('../services/flutterwave.service.js')).default;

    if (!signature || !flutterwaveService.verifyWebhookHash(signature)) {
      console.warn('Flutterwave webhook signature mismatch or missing signature');
      return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
    }

    const { event, data } = req.body || {};

    if (!event || !data) {
      return res.status(400).json({ success: false, message: 'Invalid payload structure' });
    }

    console.log(`[Flutterwave Webhook Received] Event: ${event}, Status: ${data.status}, Reference: ${data.tx_ref || data.reference}`);

    // Event 1: Payment Charge Completed (Deposits, Job Postings, Escrow Payments)
    if (event === 'charge.completed') {
      const chargeStatus = (data.status || '').toLowerCase();
      if (chargeStatus === 'successful') {
        const settlementResult = await settleSuccessfulFlutterwavePayment(null, data, 'webhook');
        return res.status(200).json({
          status: 'success',
          settlement: settlementResult
        });
      } else if (chargeStatus === 'failed' || chargeStatus === 'cancelled') {
        const txRef = data.tx_ref;
        if (txRef) {
          await Payment.updateOne(
            {
              $or: [
                { transactionId: txRef },
                { gatewayReference: txRef },
                ...(mongoose.isValidObjectId(txRef) ? [{ _id: txRef }] : [])
              ]
            },
            {
              $set: {
                status: 'failed',
                gatewayResponse: data,
                'metadata.failureReason': data.processor_response || 'Payment failed at gateway'
              }
            }
          );
        }
        return res.status(200).json({ status: 'success', message: 'Charge marked as failed' });
      }
    }

    // Event 2: Payout Transfer Completed (Withdrawals)
    if (event === 'transfer.completed') {
      const transferResult = await settleFlutterwaveWithdrawal(data.reference, data, 'webhook');
      return res.status(200).json({
        status: 'success',
        transfer: transferResult
      });
    }

    // Acknowledge other event types with 200 OK
    return res.status(200).json({ status: 'success', message: `Event ${event} acknowledged` });
  } catch (err: any) {
    console.error('handleFlutterwaveWebhook error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

