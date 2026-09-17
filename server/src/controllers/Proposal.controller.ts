import { Request, Response } from 'express';
import mongoose from 'mongoose';
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
    const rawId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    if (!rawId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const freelancerId = mongoose.Types.ObjectId.isValid(rawId) ? new mongoose.Types.ObjectId(rawId) : rawId;
    const { jobId, description, price, deliveryTime, coverLetter, bidAmount, estimatedDays } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'jobId is required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Check if client is trying to apply to own job
    if (job.clientId && job.clientId.toString() === rawId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot apply to your own job listing' });
    }

    // Check if job is still active
    if (job.status === 'closed' || (job.status as string) === 'completed') {
      return res.status(400).json({ success: false, message: 'This job listing is closed and no longer accepting proposals' });
    }

    // PREVENT DUPLICATE APPLICATIONS
    const existingProposal = await Proposal.findOne({
      jobId: job._id,
      $or: [
        { freelancerId },
        { freelancerId: String(rawId) }
      ]
    });

    if (existingProposal) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied to this job',
        hasApplied: true,
        data: existingProposal
      });
    }

    const finalPrice = Number(price ?? bidAmount ?? 0);
    const finalDeliveryTime = Number(deliveryTime ?? estimatedDays ?? 14);
    const finalDescription = description || coverLetter || '';

    const proposal = await Proposal.create({
      jobId: job._id,
      clientId: job.clientId,
      freelancerId,
      description: finalDescription,
      price: finalPrice,
      deliveryTime: finalDeliveryTime,
      status: 'pending',
      aiInterviewStatus: job.requireAiInterview ? 'pending' : 'not_required'
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
    const rawId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    if (!rawId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const freelancerId = mongoose.Types.ObjectId.isValid(rawId) ? new mongoose.Types.ObjectId(rawId) : rawId;

    const proposals = await Proposal.find({
      $or: [
        { freelancerId },
        { freelancerId: String(rawId) }
      ]
    })
      .populate({
        path: 'jobId',
        select: 'title budget status clientId requireAiInterview category location company currency duration',
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
    const rawId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    if (!rawId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const userObjectId = mongoose.Types.ObjectId.isValid(rawId) ? new mongoose.Types.ObjectId(rawId) : rawId;
    const userType = (req as any).user?.userType;

    let query: any = {};
    if (userType === 'client') {
      query = { $or: [{ clientId: userObjectId }, { clientId: String(rawId) }] };
    } else {
      query = { $or: [{ freelancerId: userObjectId }, { freelancerId: String(rawId) }] };
    }

    const proposals = await Proposal.find(query)
      .populate('freelancerId', 'firstName lastName email profileImage')
      .populate('clientId', 'firstName lastName email profileImage')
      .populate('jobId', 'title budget status currency')
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
        select: 'title budget description clientId requireAiInterview',
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

      // Notify freelancer of acceptance
      try {
        const client = await User.findById(job?.clientId);
        const clientName = client ? `${client.firstName} ${client.lastName || ''}`.trim() : 'Client';
        await createNotification({
          userId: proposal.freelancerId,
          type: 'proposal_accepted',
          title: '🎉 Proposal Accepted!',
          message: `${clientName} accepted your proposal for "${job?.title || 'Job'}". You are now hired!`,
          relatedId: proposal.jobId,
          relatedType: 'job',
          actorName: clientName,
          link: '/proposals',
          priority: 'high',
        });
      } catch (notifErr) {
        console.warn('Failed to notify proposal acceptance:', notifErr);
      }
    } else if (proposal && (status === 'declined' || status === 'rejected')) {
      try {
        await createNotification({
          userId: proposal.freelancerId,
          type: 'proposal_rejected',
          title: 'Proposal Status Update',
          message: 'Your proposal for a role has been reviewed and declined.',
          relatedId: proposal.jobId,
          relatedType: 'job',
          link: '/proposals',
          priority: 'medium',
        });
      } catch (notifErr) {
        console.warn('Failed to notify proposal decline:', notifErr);
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

// Update proposal (Freelancer edit proposal when pending)
export const updateProposal = async (req: Request, res: Response) => {
  try {
    const rawId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    if (!rawId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    if (proposal.freelancerId.toString() !== rawId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized: you can only edit your own proposal' });
    }

    if (proposal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot edit proposal with status '${proposal.status}'. Only pending proposals can be edited.`
      });
    }

    const { description, coverLetter, price, bidAmount, deliveryTime, estimatedDays } = req.body;

    if (description !== undefined || coverLetter !== undefined) {
      proposal.description = (description !== undefined ? description : coverLetter) || '';
    }

    if (price !== undefined || bidAmount !== undefined) {
      const parsedPrice = Number(price !== undefined ? price : bidAmount);
      if (!isNaN(parsedPrice) && parsedPrice >= 0) {
        proposal.price = parsedPrice;
      }
    }

    if (deliveryTime !== undefined || estimatedDays !== undefined) {
      const parsedDelivery = Number(deliveryTime !== undefined ? deliveryTime : estimatedDays);
      if (!isNaN(parsedDelivery) && parsedDelivery >= 1) {
        proposal.deliveryTime = parsedDelivery;
      }
    }

    await proposal.save();

    const updated = await Proposal.findById(proposal._id)
      .populate('freelancerId', 'firstName lastName email profileImage jobTitle rating jobSuccessScore isVerified')
      .populate('clientId', 'firstName lastName email profileImage location paymentVerified isPremium')
      .populate({
        path: 'jobId',
        select: 'title budget status currency duration requireAiInterview category'
      });

    res.status(200).json({
      success: true,
      message: 'Proposal updated successfully',
      data: updated
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Withdraw proposal (Freelancer withdraws proposal when pending)
export const withdrawProposal = async (req: Request, res: Response) => {
  try {
    const rawId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    if (!rawId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    if (proposal.freelancerId.toString() !== rawId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized: you can only withdraw your own proposal' });
    }

    if (proposal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw proposal with status '${proposal.status}'. Only pending proposals can be withdrawn.`
      });
    }

    proposal.status = 'withdrawn';
    await proposal.save();

    const updated = await Proposal.findById(proposal._id)
      .populate('freelancerId', 'firstName lastName email profileImage jobTitle')
      .populate('clientId', 'firstName lastName email profileImage')
      .populate('jobId', 'title budget status currency');

    res.status(200).json({
      success: true,
      message: 'Proposal withdrawn successfully',
      data: updated
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

