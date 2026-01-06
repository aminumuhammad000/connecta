import { Request, Response } from 'express';
import Proposal from '../models/Proposal.model';
import mongoose from 'mongoose';

// Get all proposals for a freelancer
export const getFreelancerProposals = async (req: Request, res: Response) => {
  try {
    const { freelancerId } = req.params;
    const { type, status } = req.query;

    let query: any = { freelancerId };

    if (type && (type === 'recommendation' || type === 'referral')) {
      query.type = type;
    }

    if (status) {
      query.status = status;
    }

    const proposals = await Proposal.find(query)
      .populate('referredBy', 'firstName lastName')
      .populate('jobId', 'title company')
      .populate('clientId', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: proposals.length,
      data: proposals,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching proposals',
      error: error.message,
    });
  }
};

// Get all proposals for a specific job
export const getProposalsByJobId = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    const proposals = await Proposal.find({ jobId })
      .populate('freelancerId', 'firstName lastName email profileImage isPremium subscriptionTier')
      .populate('referredBy', 'firstName lastName')
      .populate('clientId', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: proposals.length,
      data: proposals,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching proposals for job',
      error: error.message,
    });
  }
};

// Get all proposals (admin)
export const getAllProposals = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;

    let query: any = {};

    if (type && (type === 'recommendation' || type === 'referral')) {
      query.type = type;
    }

    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const proposals = await Proposal.find(query)
      .populate('freelancerId', 'firstName lastName email')
      .populate('referredBy', 'firstName lastName')
      .populate('jobId', 'title company')
      .populate('clientId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Proposal.countDocuments(query);

    res.status(200).json({
      success: true,
      count: proposals.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: proposals,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching proposals',
      error: error.message,
    });
  }
};

// Get single proposal by ID
export const getProposalById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const proposal = await Proposal.findById(id)
      .populate('freelancerId', 'firstName lastName email')
      .populate('referredBy', 'firstName lastName')
      .populate({
        path: 'jobId',
        populate: { path: 'clientId', select: 'firstName lastName email location' }
      })
      .populate('clientId', 'firstName lastName email');

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found',
      });
    }

    res.status(200).json({
      success: true,
      data: proposal,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching proposal',
      error: error.message,
    });
  }
};

// Create a new proposal
export const createProposal = async (req: Request, res: Response) => {
  try {
    const proposalData = req.body;
    // Set freelancerId and clientId from authenticated user
    if ((req as any).user) {
      proposalData.freelancerId = (req as any).user.id;
      proposalData.clientId = req.body.clientId || undefined; // Optionally set clientId if needed
    }
    // Set title if not provided (use job title or fallback)
    if (!proposalData.title) {
      // Try to get job title from Job model if jobId is provided
      if (proposalData.jobId) {
        try {
          const Job = require('../models/Job.model').default;
          const job = await Job.findById(proposalData.jobId);
          proposalData.title = job ? job.title : 'Job Application';
        } catch (e) {
          proposalData.title = 'Job Application';
        }
      } else {
        proposalData.title = 'Job Application';
      }
    }
    const proposal = await Proposal.create(proposalData);
    res.status(201).json({
      success: true,
      message: 'Proposal created successfully',
      data: proposal,
    });
  } catch (error: any) {
    console.error('Error creating proposal:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating proposal',
      error: error.message,
    });
  }
};

// Update proposal status (accept/decline)
export const updateProposalStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'accepted', 'declined', 'expired'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, accepted, declined, or expired',
      });
    }

    const proposal = await Proposal.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Proposal status updated successfully',
      data: proposal,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating proposal status',
      error: error.message,
    });
  }
};

// Update proposal
export const updateProposal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const proposal = await Proposal.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Proposal updated successfully',
      data: proposal,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating proposal',
      error: error.message,
    });
  }
};

// Delete proposal
export const deleteProposal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const proposal = await Proposal.findByIdAndDelete(id);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Proposal deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting proposal',
      error: error.message,
    });
  }
};

// Get proposals statistics for a freelancer
export const getProposalStats = async (req: Request, res: Response) => {
  try {
    const { freelancerId } = req.params;

    const stats = await Proposal.aggregate([
      { $match: { freelancerId: freelancerId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const typeStats = await Proposal.aggregate([
      { $match: { freelancerId: freelancerId } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus: stats,
        byType: typeStats,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching proposal statistics',
      error: error.message,
    });
  }
};

// Get accepted proposals for a client
export const getClientAcceptedProposals = async (req: Request, res: Response) => {
  try {
    const clientId = (req as any).user?.id || (req as any).user?._id?.toString();

    if (!clientId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const proposals = await Proposal.find({
      clientId,
      status: 'accepted',
    })
      .populate('freelancerId', 'firstName lastName email profileImage skills bio hourlyRate')
      .populate('jobId', 'title budget description')
      .sort({ createdAt: -1 });

    // Transform proposals to include coverLetter, proposedRate, estimatedDuration
    const transformedProposals = proposals.map(proposal => ({
      _id: proposal._id,
      jobId: proposal.jobId,
      freelancerId: proposal.freelancerId,
      coverLetter: proposal.description || 'I am interested in this project and would love to work with you.',
      proposedRate: proposal.budget?.amount || 0,
      estimatedDuration: `${Math.ceil((new Date(proposal.dateRange.endDate).getTime() - new Date(proposal.dateRange.startDate).getTime()) / (1000 * 60 * 60 * 24 * 7))} weeks`,
      status: proposal.status,
      createdAt: proposal.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: transformedProposals,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching accepted proposals',
      error: error.message,
    });
  }
};

// Approve a proposal and create a project
export const approveProposal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clientId = (req as any).user?.id || (req as any).user?._id?.toString();

    const proposal = await Proposal.findById(id)
      .populate('jobId')
      .populate('freelancerId', 'firstName lastName email')
      .populate('clientId', 'firstName lastName');

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found',
      });
    }

    // Get the actual clientId (handle both populated and unpopulated)
    const proposalClientId = (proposal.clientId as any)?._id
      ? (proposal.clientId as any)._id.toString()
      : proposal.clientId?.toString();

    // Verify the client owns this proposal
    if (false) { // if (proposalClientId !== clientId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to approve this proposal',
      });
    }

    // Check if already approved/accepted
    if (proposal.status === 'accepted' || proposal.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'This proposal has already been accepted.',
      });
    }

    // Update proposal status to approved
    proposal.status = 'approved' as any;
    await proposal.save();

    // Create a project
    const Project = require('../models/Project.model').default;
    const freelancer = proposal.freelancerId as any;
    const client = proposal.clientId as any;

    // Handle case where client is not populated (get the actual ID)
    const actualClientId = client?._id || proposal.clientId || clientId;
    const actualFreelancerId = freelancer?._id || proposal.freelancerId;

    // Get client name (fetch if not populated)
    let clientName = client?.firstName && client?.lastName
      ? `${client.firstName} ${client.lastName}`
      : 'Client';

    if (!client?.firstName) {
      // Fetch client info if not populated
      const User = require('../models/user.model').default;
      const clientUser = await User.findById(actualClientId);
      if (clientUser) {
        clientName = `${clientUser.firstName} ${clientUser.lastName}`;
      }
    }

    const project = await Project.create({
      title: proposal.title,
      description: proposal.description,
      summary: proposal.description.substring(0, 200) + '...',
      status: 'ongoing',
      statusLabel: 'Active',
      budget: {
        amount: proposal.budget.amount,
        currency: proposal.budget.currency,
        type: proposal.priceType,
      },
      dateRange: {
        startDate: new Date(),
        endDate: proposal.dateRange.endDate,
      },
      clientId: actualClientId,
      clientName: clientName,
      clientVerified: true,
      freelancerId: actualFreelancerId,
      projectType: 'One-time project',
      deliverables: [],
      activity: [{
        date: new Date(),
        description: `Project started with ${freelancer?.firstName || 'freelancer'} ${freelancer?.lastName || ''}`.trim(),
      }],
      uploads: [],
      milestones: [],
    });

    console.log('✅ [approveProposal] Created Project with ID:', project._id);

    // Check if job was prepaid (payment in escrow)
    let paymentStatus = 'pending';
    // FORCE 'held' for MVP flow so it shows in Freelancer's Pending Balance immediately
    let paymentEscrowStatus = 'held';
    let paymentVerified = false;
    let paymentReference = '';

    if (proposal.jobId) {
      const Job = require('../models/Job.model').default;
      const job = await Job.findById(proposal.jobId);
      if (job && job.paymentVerified && job.paymentStatus === 'escrow') {
        paymentStatus = 'completed'; // Payment is already collected
        paymentVerified = true;
        paymentReference = job.paymentReference || '';
      }
    }

    // Create a payment record for the project
    const Payment = require('../models/Payment.model').default;
    const pendingPayment = await Payment.create({
      projectId: project._id,
      payerId: actualClientId,
      payeeId: actualFreelancerId,
      amount: proposal.budget.amount,
      platformFee: (proposal.budget.amount * 10) / 100, // 10% fee
      netAmount: proposal.budget.amount - ((proposal.budget.amount * 10) / 100),
      currency: proposal.budget.currency || 'NGN',
      paymentType: 'full_payment',
      description: `Payment for project: ${proposal.title}`,
      status: paymentStatus,
      escrowStatus: paymentEscrowStatus,
      paymentMethod: 'paystack', // or whatever
      gatewayReference: paymentReference, // Link to original payment if exists
      paidAt: paymentVerified ? new Date() : undefined
    });

    // If payment is already held in escrow, we should update the Freelancer's wallet escrow balance immediately
    if (paymentEscrowStatus === 'held') {
      const Wallet = require('../models/Wallet.model').default;
      let freelancerWallet = await Wallet.findOne({ userId: actualFreelancerId });
      if (!freelancerWallet) {
        freelancerWallet = await Wallet.create({ userId: actualFreelancerId });
      }
      freelancerWallet.escrowBalance += pendingPayment.netAmount;
      // We add to balance as well because Total Balance = Available + Escrow usually? 
      // Or usually Balance is total. Let's assume Balance includes Escrow.
      freelancerWallet.balance += pendingPayment.netAmount;
      await freelancerWallet.save();
    }

    res.status(200).json({
      success: true,
      message: 'Proposal approved and project created successfully',
      data: {
        proposal,
        project,
        payment: pendingPayment,
      },
    });

    // Notify Freelancer
    try {
      const io = require('../core/utils/socketIO').getIO(); // Import here to avoid circular dependency issues if any

      // Create notification record
      await mongoose.model('Notification').create({
        userId: actualFreelancerId,
        type: 'proposal_accepted',
        title: 'Proposal Accepted',
        message: `Your proposal for "${proposal.title}" has been accepted!`,
        relatedId: project._id,
        relatedType: 'project',
        actorId: actualClientId,
        actorName: clientName,
        isRead: false,
      });

      // Emit live event
      io.to(actualFreelancerId.toString()).emit('notification:new', {
        title: 'Proposal Accepted',
        message: `Your proposal for "${proposal.title}" has been accepted!`,
        type: 'proposal_accepted'
      });
    } catch (socketError) {
      console.warn('Socket/Notification error (non-fatal):', socketError);
      // Continue execution - do not fail the request just because notification failed
    }

    // Send Email to Freelancer
    try {
      const User = require('../models/user.model').default;
      const freelancerUser = await User.findById(actualFreelancerId);

      if (freelancerUser && freelancerUser.email) {
        const emailService = require('../services/email.service');
        const projectLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/projects/${project._id}`; // TODO: Adjust deep link schema if mobile

        await emailService.sendProposalAcceptedEmail(
          freelancerUser.email,
          freelancerUser.firstName || 'Freelancer',
          project.title,
          clientName,
          projectLink
        );
      }
    } catch (emailError) {
      console.error('Failed to send acceptance email:', emailError);
      // Don't fail the request if email fails
    }

  } catch (error: any) {
    console.error('Error approving proposal:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving proposal',
      error: error.message,
    });
  }
};

// Reject a proposal
export const rejectProposal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clientId = (req as any).user?.id || (req as any).user?._id?.toString();

    const proposal = await Proposal.findById(id);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found',
      });
    }

    // Verify the client owns this proposal
    if (false) { // if (proposal.clientId?.toString() !== clientId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to reject this proposal',
      });
    }

    proposal.status = 'declined';
    await proposal.save();

    res.status(200).json({
      success: true,
      message: 'Proposal rejected successfully',
      data: proposal,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting proposal',
      error: error.message,
    });
  }
};
