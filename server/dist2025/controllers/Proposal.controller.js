import Proposal from '../models/Proposal.model.js';
import { Job } from '../models/Job.model.js';
import Project from '../models/Project.model.js';
import User from '../models/user.model.js';
import Payment from '../models/Payment.model.js';
import Wallet from '../models/Wallet.model.js';
import Transaction from '../models/Transaction.model.js';
import { createNotification } from './notification.controller.js';
// Submit a proposal
export const createProposal = async (req, res) => {
    try {
        const freelancerId = req.user?._id;
        const { jobId, description, price, deliveryTime } = req.body;
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }
        const proposal = await Proposal.create({
            jobId,
            clientId: job.clientId,
            freelancerId,
            description,
            price,
            deliveryTime,
            status: 'pending'
        });
        // Notification for Client (New Proposal)
        try {
            const { notifyProposalReceived } = await import('./notification.controller.js');
            const freelancer = await User.findById(freelancerId);
            await notifyProposalReceived(job.clientId, freelancer ? `${freelancer.firstName} ${freelancer.lastName}` : 'Freelancer', job.title, proposal._id);
        }
        catch (err) {
            console.error('Failed to notify client of new proposal:', err);
        }
        res.status(201).json({ success: true, data: proposal });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Get proposals for a specific job (for client)
export const getProposalsByJobId = async (req, res) => {
    try {
        const { jobId } = req.params;
        const proposals = await Proposal.find({ jobId })
            .populate('freelancerId', 'firstName lastName email profileImage')
            .populate('clientId', 'firstName lastName email profileImage')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: proposals });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Get my proposals (for freelancer)
export const getMyProposals = async (req, res) => {
    try {
        const freelancerId = req.user?._id;
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Get all proposals (Client sees received, Freelancer sees sent)
export const getAllProposals = async (req, res) => {
    try {
        const userId = req.user?._id;
        const userType = req.user?.userType;
        let query = {};
        if (userType === 'client') {
            query = { clientId: userId };
        }
        else {
            query = { freelancerId: userId };
        }
        const proposals = await Proposal.find(query)
            .populate('freelancerId', 'firstName lastName email profileImage')
            .populate('clientId', 'firstName lastName email profileImage')
            .populate('jobId', 'title budget status')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: proposals });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Get single proposal
export const getProposalById = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Approve a proposal (Hire)
export const approveProposal = async (req, res) => {
    try {
        const { id } = req.params;
        const clientId = req.user?._id;
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
        const amount = proposal.price || 0;
        const platformFee = Math.round(amount * 0.1); // 10% platform fee
        const netAmount = amount - platformFee; // freelancer receives this
        // ── Check & deduct client wallet ──────────────────────────────
        let clientWallet = await Wallet.findOne({ userId: clientId });
        if (!clientWallet) {
            clientWallet = new Wallet({ userId: clientId });
            await clientWallet.save();
        }
        if ((clientWallet.availableBalance || 0) < amount) {
            return res.status(400).json({
                success: false,
                message: `Insufficient wallet balance. You need ₦${amount.toLocaleString()} but have ₦${(clientWallet.availableBalance || 0).toLocaleString()} available. Please top up your wallet first.`,
            });
        }
        // Deduct from client
        const clientBalanceBefore = clientWallet.balance;
        clientWallet.balance -= amount;
        clientWallet.totalSpent = (clientWallet.totalSpent || 0) + amount;
        await clientWallet.save(); // pre-save hook updates client's availableBalance
        // Update proposal status
        proposal.status = 'accepted';
        await proposal.save();
        // Close job
        job.status = 'closed';
        await job.save();
        const client = await User.findById(clientId);
        // Create Project
        const project = await Project.create({
            title: job.title,
            description: job.description,
            summary: proposal.description || job.description,
            dateRange: {
                startDate: new Date(),
                endDate: new Date(Date.now() + (proposal.deliveryTime || 7) * 24 * 60 * 60 * 1000)
            },
            status: 'ongoing',
            statusLabel: 'Active',
            clientId: clientId,
            clientName: client ? `${client.firstName} ${client.lastName}` : 'Client',
            freelancerId: proposal.freelancerId,
            budget: {
                amount: proposal.price || 0,
                currency: '₦',
                type: 'fixed'
            },
            projectType: 'One-time project',
            activity: [{
                    date: new Date(),
                    description: 'Project started. Proposal accepted.'
                }]
        });
        // Create Payment record (Escrow held)
        const payment = await Payment.create({
            projectId: project._id,
            jobId: job._id,
            payerId: clientId,
            payeeId: proposal.freelancerId,
            amount,
            platformFee,
            netAmount,
            status: 'completed',
            paymentMethod: 'wallet',
            paymentType: 'project_payment',
            escrowStatus: 'held',
            description: `Payment for project: ${job.title}`,
            paidAt: new Date(),
            gatewayReference: `ESCROW-${Date.now()}`
        });
        // ── Credit freelancer wallet (balance + escrow) ──────────────
        // balance increases so wallet has the funds.
        // escrowBalance increases by the same amount so availableBalance stays 0
        // until the client approves the completed work.
        let freelancerWallet = await Wallet.findOne({ userId: proposal.freelancerId });
        if (!freelancerWallet) {
            freelancerWallet = new Wallet({ userId: proposal.freelancerId });
        }
        const freelancerBalanceBefore = freelancerWallet.balance;
        freelancerWallet.balance = (freelancerWallet.balance || 0) + netAmount;
        freelancerWallet.escrowBalance = (freelancerWallet.escrowBalance || 0) + netAmount;
        // pre-save hook: availableBalance = balance - escrowBalance → 0 while locked
        await freelancerWallet.save();
        // ── Transaction records ───────────────────────────────────────
        // 1. Client debit
        await Transaction.create({
            userId: clientId,
            type: 'payment_sent',
            amount,
            currency: 'NGN',
            status: 'completed',
            gateway: 'vtstack',
            paymentId: payment._id,
            projectId: project._id,
            balanceBefore: clientBalanceBefore,
            balanceAfter: clientWallet.balance,
            description: `Escrow payment for project: ${job.title}`,
            metadata: { platformFee, netAmount, proposalId: proposal._id.toString() },
        });
        // 2. Freelancer escrow credit (locked — not yet available)
        await Transaction.create({
            userId: proposal.freelancerId,
            type: 'payment_received',
            amount: netAmount,
            currency: 'NGN',
            status: 'pending', // pending = locked in escrow
            paymentId: payment._id,
            projectId: project._id,
            balanceBefore: freelancerBalanceBefore,
            balanceAfter: freelancerWallet.balance,
            description: `🔒 Funds locked in escrow for project: ${job.title}. Will be released when client approves completion.`,
            metadata: { escrow: true, platformFee, proposalId: proposal._id.toString() },
        });
        // ── Notifications ─────────────────────────────────────────────
        try {
            const { notifyProposalAccepted } = await import('./notification.controller.js');
            await notifyProposalAccepted(proposal.freelancerId, client ? `${client.firstName} ${client.lastName}` : 'Client', job.title, project._id);
        }
        catch (err) {
            console.error('Failed to notify proposal acceptance:', err);
        }
        // Notify freelancer about locked funds
        await createNotification({
            userId: proposal.freelancerId,
            type: 'payment_received',
            title: '🔒 Payment Locked in Escrow',
            message: `₦${netAmount.toLocaleString()} has been locked for your project "${job.title}". Funds will be released to your available balance once the client approves your work.`,
            relatedId: payment._id,
            relatedType: 'payment',
            priority: 'high',
        });
        res.status(200).json({
            success: true,
            message: 'Proposal approved and project created',
            data: { proposal, project }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Reject a proposal
export const rejectProposal = async (req, res) => {
    try {
        const { id } = req.params;
        const proposal = await Proposal.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
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
        }
        catch (err) {
            console.error('Failed to notify proposal rejection:', err);
        }
        res.status(200).json({ success: true, message: 'Proposal rejected', data: proposal });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Update proposal status
export const updateProposalStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['declined', 'rejected', 'accepted'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status update for proposal' });
        }
        const proposal = await Proposal.findByIdAndUpdate(id, { status }, { new: true });
        res.status(200).json({ success: true, data: proposal });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Delete proposal
export const deleteProposal = async (req, res) => {
    try {
        await Proposal.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Proposal deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
