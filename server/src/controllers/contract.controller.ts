import { Request, Response } from 'express';
import Contract from '../models/Contract.model.js';
import Proposal from '../models/Proposal.model.js';
import { Job } from '../models/Job.model.js';
import Wallet from '../models/Wallet.model.js';
import Payment from '../models/Payment.model.js';
import { createNotification } from './notification.controller.js';

// Create a new offer (Client)
export const createOffer = async (req: Request, res: Response) => {
  try {
    const clientId = (req as any).user?._id;
    const { proposalId, title, description, totalPrice, deliveryTime } = req.body;

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    const contract = await Contract.create({
      jobId: proposal.jobId,
      clientId,
      freelancerId: proposal.freelancerId,
      proposalId,
      title,
      description,
      totalPrice,
      deliveryTime,
      status: 'pending',
      paymentStatus: 'pending'
    });

    // Notify freelancer
    await createNotification({
      userId: proposal.freelancerId,
      type: 'system',
      title: '💼 New Job Offer',
      message: `You received an offer for "${title}"`,
      relatedId: contract._id,
      relatedType: 'project',
      link: `/contracts/${contract._id}`,
      priority: 'high',
    });

    res.status(201).json({ success: true, data: contract });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Accept an offer (Freelancer)
export const acceptOffer = async (req: Request, res: Response) => {
  try {
    const freelancerId = (req as any).user?._id;
    const { id } = req.params;

    const contract = await Contract.findOne({ _id: id, freelancerId });
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found or unauthorized' });
    }

    contract.status = 'active';
    contract.paymentStatus = 'escrow'; // Assuming payment is moved to escrow on acceptance
    await contract.save();

    // Update Job status to closed/hired
    await Job.findByIdAndUpdate(contract.jobId, { status: 'closed' });

    // Notify client
    await createNotification({
      userId: contract.clientId,
      type: 'proposal_accepted',
      title: '✅ Offer Accepted',
      message: `Freelancer accepted your offer for "${contract.title}"`,
      relatedId: contract._id,
      relatedType: 'project',
      actorId: freelancerId,
      link: `/contracts/${contract._id}`,
      priority: 'high',
    });

    res.status(200).json({ success: true, data: contract });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit work (Freelancer)
export const submitWork = async (req: Request, res: Response) => {
  try {
    const freelancerId = (req as any).user?._id;
    const { id } = req.params;
    const { summary, files } = req.body;

    const contract = await Contract.findOne({ _id: id, freelancerId });
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    contract.status = 'delivered';
    contract.submission = {
      summary,
      files,
      submittedAt: new Date()
    };
    await contract.save();

    // Notify client
    await createNotification({
      userId: contract.clientId,
      type: 'system',
      title: '📦 Work Delivered',
      message: `Freelancer has delivered work for "${contract.title}"`,
      relatedId: contract._id,
      relatedType: 'project',
      link: `/contracts/${contract._id}`,
      priority: 'high',
    });

    res.status(200).json({ success: true, data: contract });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve work (Client)
export const approveWork = async (req: Request, res: Response) => {
  try {
    const clientId = (req as any).user?._id;
    const { id } = req.params;

    const contract = await Contract.findOne({ _id: id, clientId });
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    if (contract.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Contract is already completed' });
    }

    contract.status = 'completed';
    contract.paymentStatus = 'released';
    await contract.save();

    // Release funds from escrow to available balance
    const freelancerWallet = await Wallet.findOne({ userId: contract.freelancerId });
    if (freelancerWallet) {
      // Look for the corresponding payment record
      // We look for held escrow payments linked to this contract or its job
      const payment = await Payment.findOne({
        projectId: contract._id,
        payeeId: contract.freelancerId,
        escrowStatus: 'held'
      });

      if (payment) {
        payment.escrowStatus = 'released';
        payment.releasedAt = new Date();
        await payment.save();

        // Update Wallet: Deduct from escrow
        freelancerWallet.escrowBalance = Math.max(0, freelancerWallet.escrowBalance - payment.netAmount);
        freelancerWallet.totalEarnings += payment.netAmount;
        await freelancerWallet.save();
      } else {
        console.warn(`No pending escrow payment found for contract ${contract._id}`);
      }
    }

    // Notify freelancer
    await createNotification({
      userId: contract.freelancerId,
      type: 'payment_released',
      title: '🎊 Work Approved',
      message: `Client approved your work for "${contract.title}". Payment released to your wallet!`,
      relatedId: contract._id,
      relatedType: 'project',
      actorId: clientId,
      link: `/freelancer/wallet`,
      priority: 'high',
    });

    res.status(200).json({ success: true, data: contract });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user contracts
export const getUserContracts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;
    const contracts = await Contract.find({
      $or: [{ clientId: userId }, { freelancerId: userId }]
    })
    .populate('jobId', 'title budget')
    .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, data: contracts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get contract by ID
export const getContractById = async (req: Request, res: Response) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('clientId', 'firstName lastName email profileImage')
      .populate('freelancerId', 'firstName lastName email profileImage')
      .populate('jobId', 'title description budget');

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    res.status(200).json({ success: true, data: contract });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching contract details', error: error.message });
  }
};
