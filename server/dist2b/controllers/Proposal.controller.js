"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectProposal = exports.approveProposal = exports.getClientAcceptedProposals = exports.getProposalStats = exports.deleteProposal = exports.updateProposal = exports.updateProposalStatus = exports.createProposal = exports.getProposalById = exports.getAllProposals = exports.getProposalsByJobId = exports.getFreelancerProposals = void 0;
const Proposal_model_1 = __importDefault(require("../models/Proposal.model"));
const mongoose_1 = __importDefault(require("mongoose"));
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
// Get all proposals for a specific job
const getProposalsByJobId = async (req, res) => {
    try {
        const { jobId } = req.params;
        const proposals = await Proposal_model_1.default.find({ jobId })
            .populate('freelancerId', 'firstName lastName email profileImage isPremium subscriptionTier jobSuccessScore')
            .populate('referredBy', 'firstName lastName')
            .populate('clientId', 'firstName lastName');
        // Sort by Job Success Score (Higher = Better chance)
        const sortedProposals = proposals.sort((a, b) => {
            const scoreA = a.freelancerId?.jobSuccessScore || 0;
            const scoreB = b.freelancerId?.jobSuccessScore || 0;
            // Secondary sort by created date
            if (scoreA === scoreB) {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            return scoreB - scoreA;
        });
        res.status(200).json({
            success: true,
            count: sortedProposals.length,
            data: sortedProposals,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching proposals for job',
            error: error.message,
        });
    }
};
exports.getProposalsByJobId = getProposalsByJobId;
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
        const { userId } = req.query;
        if (userId) {
            query.$or = [
                { freelancerId: userId },
                { clientId: userId },
                { referredBy: userId }
            ];
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
        // Notify Client of new proposal
        try {
            if (proposalData.jobId) {
                const Job = require('../models/Job.model').default;
                const User = require('../models/user.model').default;
                const emailService = require('../services/email.service');
                const job = await Job.findById(proposalData.jobId);
                if (job && job.clientId) {
                    const client = await User.findById(job.clientId);
                    const freelancer = req.user;
                    if (client && client.email) {
                        const freelancerName = freelancer ? `${freelancer.firstName} ${freelancer.lastName}` : 'A freelancer';
                        const link = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/jobs/${job._id}`;
                        await emailService.sendNewProposalNotificationToClient(client.email, client.firstName || 'Client', freelancerName, job.title, link);
                    }
                    // Also send Socket Notification to Client
                    const io = require('../core/utils/socketIO').getIO();
                    const mongoose = require('mongoose');
                    await mongoose.model('Notification').create({
                        userId: job.clientId,
                        type: 'proposal_new',
                        title: 'New Proposal Received',
                        message: `${freelancer ? freelancer.firstName : 'A freelancer'} has applied for "${job.title}"`,
                        relatedId: proposal._id,
                        relatedType: 'proposal',
                        actorId: freelancer?._id || freelancer?.id,
                        actorName: freelancer ? `${freelancer.firstName} ${freelancer.lastName}` : 'Freelancer',
                        isRead: false,
                    });
                    io.to(job.clientId.toString()).emit('notification:new', {
                        title: 'New Proposal Received',
                        message: `${freelancer ? freelancer.firstName : 'A freelancer'} has applied for "${job.title}"`,
                        type: 'proposal_new'
                    });
                    // Send Push Notification
                    const notificationService = (await Promise.resolve().then(() => __importStar(require('../services/notification.service')))).default;
                    notificationService.sendPushNotification(job.clientId.toString(), 'New Proposal', `${freelancer ? freelancer.firstName : 'A freelancer'} applied for: ${job.title}`, { proposalId: proposal._id, type: 'proposal' });
                }
            }
        }
        catch (notifyError) {
            console.warn('Error sending new proposal notification:', notifyError);
        }
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
        const clientId = req.user?.id || req.user?._id?.toString();
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
        const clientId = req.user?.id || req.user?._id?.toString();
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
        // Check if already approved/accepted
        if (proposal.status === 'accepted' || proposal.status === 'approved') {
            return res.status(400).json({
                success: false,
                message: 'This proposal has already been accepted.',
            });
        }
        // Status update moved to end to ensure atomicity
        // Create a project
        const Project = require('../models/Project.model').default;
        const freelancer = proposal.freelancerId;
        const client = proposal.clientId;
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
            currency: (proposal.budget.currency === '$' ? 'USD' : proposal.budget.currency) || 'NGN',
            paymentType: 'full_payment',
            description: `Payment for project: ${proposal.title}`,
            status: paymentStatus,
            escrowStatus: paymentEscrowStatus,
            paymentMethod: 'paystack', // or whatever
            gatewayReference: paymentReference || undefined, // undefined to avoid unique constraint if sparse
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
        // Update proposal status to approved (Moved here)
        proposal.status = 'approved';
        await proposal.save();
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
            await mongoose_1.default.model('Notification').create({
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
            // Send Push Notification
            const notificationService = (await Promise.resolve().then(() => __importStar(require('../services/notification.service')))).default;
            notificationService.sendPushNotification(actualFreelancerId.toString(), 'Proposal Accepted', `Your proposal for "${proposal.title}" has been accepted!`, { projectId: project._id, type: 'project' });
        }
        catch (socketError) {
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
                await emailService.sendProposalAcceptedEmail(freelancerUser.email, freelancerUser.firstName || 'Freelancer', project.title, clientName, projectLink);
            }
        }
        catch (emailError) {
            console.error('Failed to send acceptance email:', emailError);
            // Don't fail the request if email fails
        }
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
        const clientId = req.user?.id || req.user?._id?.toString();
        const proposal = await Proposal_model_1.default.findById(id)
            .populate('freelancerId', 'firstName lastName email')
            .populate('clientId', 'firstName lastName')
            .populate('jobId', 'title');
        if (!proposal) {
            return res.status(404).json({
                success: false,
                message: 'Proposal not found',
            });
        }
        // Verify the client owns this proposal (Skipped as per existing logic, but good practice to keep comments)
        // if (proposal.clientId?.toString() !== clientId) ...
        proposal.status = 'declined';
        await proposal.save();
        res.status(200).json({
            success: true,
            message: 'Proposal rejected successfully',
            data: proposal,
        });
        // --- Notifications ---
        try {
            const freelancer = proposal.freelancerId;
            const client = proposal.clientId;
            const jobTitle = proposal.jobId?.title || 'Project';
            const clientName = client?.firstName ? `${client.firstName} ${client.lastName}` : 'Client';
            if (freelancer?._id) {
                const mongoose = require('mongoose');
                const io = require('../core/utils/socketIO').getIO();
                // 1. DB Notification
                await mongoose.model('Notification').create({
                    userId: freelancer._id,
                    type: 'proposal_rejected',
                    title: 'Proposal Declined',
                    message: `${clientName} has declined your proposal for "${jobTitle}".`,
                    relatedId: proposal._id,
                    relatedType: 'proposal',
                    actorId: clientId,
                    actorName: clientName,
                    isRead: false,
                });
                // 2. Socket Notification
                io.to(freelancer._id.toString()).emit('notification:new', {
                    title: 'Proposal Declined',
                    message: `${clientName} has declined your proposal for "${jobTitle}".`,
                    type: 'proposal_rejected'
                });
                // Send Push Notification
                const notificationService = (await Promise.resolve().then(() => __importStar(require('../services/notification.service')))).default;
                notificationService.sendPushNotification(freelancer._id.toString(), 'Proposal Declined', `${clientName} declined your proposal for "${jobTitle}".`, { type: 'proposal' });
                // 3. Email Notification
                if (freelancer.email) {
                    const emailService = require('../services/email.service');
                    await emailService.sendProposalRejectedEmail(freelancer.email, freelancer.firstName || 'Freelancer', clientName, jobTitle);
                }
            }
        }
        catch (notifyError) {
            console.warn('Error sending rejection notifications:', notifyError);
        }
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
