import { Request, Response } from 'express';
import Proposal from '../models/Proposal.model';

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
      .populate('jobId')
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

    const proposal = await Proposal.create(proposalData);

    res.status(201).json({
      success: true,
      message: 'Proposal created successfully',
      data: proposal,
    });
  } catch (error: any) {
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
