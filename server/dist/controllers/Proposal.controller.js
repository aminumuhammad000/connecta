"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectProposal = exports.approveProposal = exports.getClientAcceptedProposals = exports.getProposalStats = exports.deleteProposal = exports.updateProposal = exports.updateProposalStatus = exports.createProposal = exports.getProposalById = exports.getAllProposals = exports.getFreelancerProposals = void 0;
const Proposal_model_1 = __importDefault(require("../models/Proposal.model"));
// Get all proposals for a freelancer
const getFreelancerProposals = async (req, res) => {
    try {
        const { freelancerId } = req.params;
        const { type, status } = req.query;
        let query = { freelancerId };
        if (type && (type === 'recommendation' || type === 'referral')) {
            query.type = type;
        }
        if (status) {
            query.status = status;
        }
        const proposals = await Proposal_model_1.default.find(query)
            .populate('referredBy', 'firstName lastName')
            .populate('jobId', 'title company')
            .populate('clientId', 'firstName lastName')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: proposals.length,
            data: proposals,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching proposals',
            error: error.message,
        });
    }
};
exports.getFreelancerProposals = getFreelancerProposals;
// Get all proposals (admin)
const getAllProposals = async (req, res) => {
    try {
        const { page = 1, limit = 20, type, status } = req.query;
        let query = {};
        if (type && (type === 'recommendation' || type === 'referral')) {
            query.type = type;
        }
        if (status) {
            query.status = status;
        }
        const skip = (Number(page) - 1) * Number(limit);
        const proposals = await Proposal_model_1.default.find(query)
            .populate('freelancerId', 'firstName lastName email')
            .populate('referredBy', 'firstName lastName')
            .populate('jobId', 'title company')
            .populate('clientId', 'firstName lastName')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(skip);
        const total = await Proposal_model_1.default.countDocuments(query);
        res.status(200).json({
            success: true,
            count: proposals.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            data: proposals,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching proposals',
            error: error.message,
        });
    }
};
exports.getAllProposals = getAllProposals;
// Get single proposal by ID
const getProposalById = async (req, res) => {
    try {
        const { id } = req.params;
        const proposal = await Proposal_model_1.default.findById(id)
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching proposal',
            error: error.message,
        });
    }
};
exports.getProposalById = getProposalById;
// Create a new proposal
const createProposal = async (req, res) => {
    try {
        const proposalData = req.body;
        // Set freelancerId and clientId from authenticated user
        if (req.user) {
            proposalData.freelancerId = req.user.id;
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
                }
                catch (e) {
                    proposalData.title = 'Job Application';
                }
            }
            else {
                proposalData.title = 'Job Application';
            }
        }
        const proposal = await Proposal_model_1.default.create(proposalData);
        res.status(201).json({
            success: true,
            message: 'Proposal created successfully',
            data: proposal,
        });
    }
    catch (error) {
        console.error('Error creating proposal:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating proposal',
            error: error.message,
        });
    }
};
exports.createProposal = createProposal;
// Update proposal status (accept/decline)
const updateProposalStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['pending', 'accepted', 'declined', 'expired'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be pending, accepted, declined, or expired',
            });
        }
        const proposal = await Proposal_model_1.default.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating proposal status',
            error: error.message,
        });
    }
};
exports.updateProposalStatus = updateProposalStatus;
// Update proposal
const updateProposal = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const proposal = await Proposal_model_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating proposal',
            error: error.message,
        });
    }
};
exports.updateProposal = updateProposal;
// Delete proposal
const deleteProposal = async (req, res) => {
    try {
        const { id } = req.params;
        const proposal = await Proposal_model_1.default.findByIdAndDelete(id);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting proposal',
            error: error.message,
        });
    }
};
exports.deleteProposal = deleteProposal;
// Get proposals statistics for a freelancer
const getProposalStats = async (req, res) => {
    try {
        const { freelancerId } = req.params;
        const stats = await Proposal_model_1.default.aggregate([
            { $match: { freelancerId: freelancerId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);
        const typeStats = await Proposal_model_1.default.aggregate([
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching proposal statistics',
            error: error.message,
        });
    }
};
exports.getProposalStats = getProposalStats;
// Get accepted proposals for a client
const getClientAcceptedProposals = async (req, res) => {
    try {
        const clientId = req.user?.id;
        if (!clientId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }
        const proposals = await Proposal_model_1.default.find({
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching accepted proposals',
            error: error.message,
        });
    }
};
exports.getClientAcceptedProposals = getClientAcceptedProposals;
// Approve a proposal and create a project
const approveProposal = async (req, res) => {
    try {
        const { id } = req.params;
        const clientId = req.user?.id;
        const proposal = await Proposal_model_1.default.findById(id)
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
        const proposalClientId = proposal.clientId?._id
            ? proposal.clientId._id.toString()
            : proposal.clientId?.toString();
        // Verify the client owns this proposal
        if (proposalClientId !== clientId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to approve this proposal',
            });
        }
        // Update proposal status to approved
        proposal.status = 'approved';
        await proposal.save();
        // Create a project
        const Project = require('../models/Project.model').default;
        const freelancer = proposal.freelancerId;
        const client = proposal.clientId;
        // Handle case where client is not populated (get the actual ID)
        const actualClientId = client?._id || proposal.clientId;
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
        // Create a pending payment record for the freelancer wallet to show
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
            status: 'pending',
            escrowStatus: 'none',
            paymentMethod: 'paystack',
        });
        res.status(200).json({
            success: true,
            message: 'Proposal approved and project created successfully',
            data: {
                proposal,
                project,
                payment: pendingPayment,
                requiresPayment: true, // Frontend should redirect to payment
            },
        });
    }
    catch (error) {
        console.error('Error approving proposal:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving proposal',
            error: error.message,
        });
    }
};
exports.approveProposal = approveProposal;
// Reject a proposal
const rejectProposal = async (req, res) => {
    try {
        const { id } = req.params;
        const clientId = req.user?.id;
        const proposal = await Proposal_model_1.default.findById(id);
        if (!proposal) {
            return res.status(404).json({
                success: false,
                message: 'Proposal not found',
            });
        }
        // Verify the client owns this proposal
        if (proposal.clientId?.toString() !== clientId) {
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error rejecting proposal',
            error: error.message,
        });
    }
};
exports.rejectProposal = rejectProposal;
