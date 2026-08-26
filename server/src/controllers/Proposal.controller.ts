import { Request, Response } from 'express';
import Proposal from '../models/Proposal.model.js';
import { Job } from '../models/Job.model.js';
import Project from '../models/Project.model.js';
import User from '../models/user.model.js';
import Payment from '../models/Payment.model.js';
import Wallet from '../models/Wallet.model.js';
import Transaction from '../models/Transaction.model.js';
import { createNotification } from './notification.controller.js';
import { createFeedPost } from '../services/feed.service.js';
import WorkforceMember from '../models/WorkforceMember.model.js';

// Submit a proposal
export const createProposal = async (req: Request, res: Response) => {
  try {
    const freelancerId = (req as any).user?._id;
    const { jobId, description, price, deliveryTime, coverLetter, bidAmount, estimatedDays } = req.body;

    const finalPrice = Number(price ?? bidAmount ?? 0);
    const finalDeliveryTime = Number(deliveryTime ?? estimatedDays ?? 14);
    const finalDescription = description || coverLetter || '';

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const proposal = await Proposal.create({
      jobId,
      clientId: job.clientId,
      freelancerId,
      description: finalDescription,
      price: finalPrice,
      deliveryTime: finalDeliveryTime,
      status: 'pending'
    });

    // Notification for Client (New Proposal)
    try {
        const { notifyProposalReceived } = await import('./notification.controller.js');
        const freelancer = await User.findById(freelancerId);
        await notifyProposalReceived(
            job.clientId,
            freelancer ? `${freelancer.firstName} ${freelancer.lastName}` : 'Freelancer',
            job.title,
            proposal._id
        );
    } catch (err) {
        console.error('Failed to notify client of new proposal:', err);
    }

    // Publish to Feed
    try {
        const freelancer = await User.findById(freelancerId);
        createFeedPost({
          type: 'proposal_submitted',
          actor: {
            _id: freelancerId.toString(),
            firstName: freelancer ? freelancer.firstName : 'A',
            lastName: freelancer ? freelancer.lastName : 'Freelancer',
            profileImage: freelancer?.profileImage || '',
          },
          title: `New Proposal Submitted`,
          body: `${freelancer ? freelancer.firstName : 'A Freelancer'} just applied for a new role in ${job.category || 'their field'}.`,
          emoji: '🚀',
          relatedType: 'job',
          relatedId: job._id?.toString(),
          targetAudience: 'freelancers',
        }).catch(err => console.error("Feed error:", err));
    } catch(err) {
        console.error("Feed emit error:", err);
    }

    res.status(201).json({ success: true, data: proposal });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get proposals for a specific job (for client)
export const getProposalsByJobId = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const proposals = await Proposal.find({ jobId })
      .populate('freelancerId', 'firstName lastName email profileImage bio location rating jobSuccessScore isVerified verificationTier skills hourlyRate jobTitle userType')
      .populate('clientId', 'firstName lastName email profileImage location paymentVerified')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: proposals });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get my proposals (for freelancer)
export const getMyProposals = async (req: Request, res: Response) => {
  try {
    const freelancerId = (req as any).user?._id;
    const proposals = await Proposal.find({ freelancerId })
      .populate({
        path: 'jobId',
        select: 'title budget status clientId',
        populate: {
          path: 'clientId',
          select: 'firstName lastName email profileImage'
        }
      })
      .populate('clientId', 'firstName lastName email profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: proposals });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all proposals (Client sees received, Freelancer sees sent)
export const getAllProposals = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;
    const userType = (req as any).user?.userType;

    let query = {};
    if (userType === 'client') {
      query = { clientId: userId };
    } else {
      query = { freelancerId: userId };
    }

    const proposals = await Proposal.find(query)
      .populate('freelancerId', 'firstName lastName email profileImage')
      .populate('clientId', 'firstName lastName email profileImage')
      .populate('jobId', 'title budget status')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: proposals });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get ALL proposals (no user filter)
export const getAllProposalsAdmin = async (req: Request, res: Response) => {
  try {
    const { status, search, limit = 100, page = 1 } = req.query;
    const filter: any = {};
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { coverLetter: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [proposals, total] = await Promise.all([
      Proposal.find(filter)
        .populate('freelancerId', 'firstName lastName email profileImage')
        .populate('clientId', 'firstName lastName email profileImage')
        .populate('jobId', 'title budget status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Proposal.countDocuments(filter),
    ]);
    res.status(200).json({ success: true, data: proposals, total, page: Number(page), limit: Number(limit) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single proposal
export const getProposalById = async (req: Request, res: Response) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate('freelancerId', 'firstName lastName email profileImage jobTitle rating jobSuccessScore isVerified')
      .populate('clientId', 'firstName lastName email profileImage location paymentVerified isPremium')
      .populate({
        path: 'jobId',
        select: 'title budget description clientId',
        populate: {
          path: 'clientId',
          select: 'firstName lastName email profileImage location paymentVerified isPremium'
        }
      });

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    res.status(200).json({ success: true, data: proposal });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve a proposal (Hire)
export const approveProposal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clientId = (req as any).user?._id;

    const proposal = await Proposal.findById(id).populate('jobId');
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    if (proposal.status === 'accepted') {
      return res.status(400).json({ success: false, message: 'Proposal already accepted' });
    }

    const job = await Job.findById(proposal.jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Update proposal status to accepted
    proposal.status = 'accepted';
    await proposal.save();

    // Add / Update worker on employer's active workforce roster
    const freelancer = await User.findById(proposal.freelancerId);
    if (freelancer && job) {
      await WorkforceMember.findOneAndUpdate(
        { companyId: job.clientId, workerId: freelancer._id },
        {
          companyId: job.clientId,
          workerId: freelancer._id,
          fullName: `${freelancer.firstName} ${freelancer.lastName || ''}`.trim(),
          email: freelancer.email,
          phone: freelancer.phoneNumber || '',
          role: job.title,
          status: 'active',
          inviteStatus: 'accepted',
          companyRole: 'worker',
          paymentAmount: proposal.price || job.budget || 150000,
          paymentType: 'monthly',
          currency: job.currency || 'NGN',
        },
        { upsert: true, new: true }
      );
    }

    const client = await User.findById(clientId);

    // ── Notifications ─────────────────────────────────────────────
    try {
      const { notifyProposalAccepted } = await import('./notification.controller.js');
      await notifyProposalAccepted(
        proposal.freelancerId,
        client ? `${client.firstName} ${client.lastName}` : 'Client',
        job.title,
        job._id
      );
    } catch (err) {
      console.error('Failed to notify proposal acceptance:', err);
    }

    // Publish to Feed
    try {
      const freelancerUser = await User.findById(proposal.freelancerId).select('firstName lastName').lean();
      const freelancerName = freelancerUser ? `${(freelancerUser as any).firstName || ''} ${(freelancerUser as any).lastName || ''}`.trim() : 'a worker';
      createFeedPost({
        type: 'proposal_accepted',
        emoji: '🤝',
        title: `${freelancerName} got hired!`,
        body: `${freelancerName} was hired for "${job.title}". Congratulations! 🎉`,
        relatedType: 'project',
        relatedId: job._id?.toString(),
        targetAudience: 'all',
      });
    } catch (feedErr) {
      console.warn('[Proposal] Feed post failed:', feedErr);
    }

    res.status(200).json({ 
      success: true, 
      message: 'Worker hired and added to active workforce company', 
      data: proposal 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject a proposal
export const rejectProposal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const proposal = await Proposal.findByIdAndUpdate(
      id, 
      { status: 'rejected' }, 
      { new: true }
    );

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    // Notification for Freelancer (Proposal Rejected)
    try {
        const { createNotification } = await import('./notification.controller.js');
        await createNotification({
            userId: proposal.freelancerId,
            type: 'proposal_rejected',
            title: 'Proposal Status Update',
            message: `Your proposal for a job has been reviewed and declined.`,
            relatedId: proposal.jobId,
            relatedType: 'job',
            priority: 'medium'
        });
    } catch (err) {
        console.error('Failed to notify proposal rejection:', err);
    }

    res.status(200).json({ success: true, message: 'Proposal rejected', data: proposal });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update proposal status
export const updateProposalStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['declined', 'rejected', 'accepted'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status update for proposal' });
    }

    const proposal = await Proposal.findByIdAndUpdate(id, { status }, { new: true });

    if (proposal && (status === 'accepted' || status === 'hired')) {
      const freelancer = await User.findById(proposal.freelancerId);
      const job = await Job.findById(proposal.jobId);
      if (freelancer && job) {
        await WorkforceMember.findOneAndUpdate(
          { companyId: job.clientId, workerId: freelancer._id },
          {
            companyId: job.clientId,
            workerId: freelancer._id,
            fullName: `${freelancer.firstName} ${freelancer.lastName || ''}`.trim(),
            email: freelancer.email,
            phone: freelancer.phoneNumber || '',
            role: job.title,
            status: 'active',
            inviteStatus: 'accepted',
            companyRole: 'worker',
            paymentAmount: proposal.price || job.budget || 150000,
            paymentType: 'monthly',
            currency: job.currency || 'NGN',
          },
          { upsert: true, new: true }
        );
      }
    }

    res.status(200).json({ success: true, data: proposal });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete proposal
export const deleteProposal = async (req: Request, res: Response) => {
  try {
    await Proposal.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Proposal deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
