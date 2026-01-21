"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentMessages = exports.getTopFreelancers = exports.getFreelancerDashboard = exports.getClientDashboard = exports.getAdminStats = void 0;
const Job_model_1 = __importDefault(require("../models/Job.model"));
const Project_model_1 = __importDefault(require("../models/Project.model"));
const Message_model_1 = __importDefault(require("../models/Message.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const Conversation_model_1 = __importDefault(require("../models/Conversation.model"));
const Proposal_model_1 = __importDefault(require("../models/Proposal.model"));
const Payment_model_1 = __importDefault(require("../models/Payment.model"));
const Wallet_model_1 = __importDefault(require("../models/Wallet.model"));
const mongoose_1 = __importDefault(require("mongoose"));
// Get Admin Dashboard Data
const getAdminStats = async (req, res) => {
    try {
        // 1. User Stats
        const totalUsers = await user_model_1.default.countDocuments();
        const totalClients = await user_model_1.default.countDocuments({ userType: 'client' });
        const totalFreelancers = await user_model_1.default.countDocuments({ userType: 'freelancer' });
        // 2. Job Stats
        const totalJobs = await Job_model_1.default.countDocuments();
        const activeJobs = await Job_model_1.default.countDocuments({ status: { $in: ['Open', 'open', 'active'] } });
        // 3. Project Stats
        const totalProjects = await Project_model_1.default.countDocuments();
        const activeProjects = await Project_model_1.default.countDocuments({ status: { $in: ['ongoing', 'active', 'In-Progress'] } });
        const completedProjects = await Project_model_1.default.countDocuments({ status: 'completed' });
        // 4. Financial Stats
        const revenueResult = await Payment_model_1.default.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;
        const pendingPaymentsCount = await Payment_model_1.default.countDocuments({ status: 'pending' });
        // 5. Proposals
        const totalProposals = await Proposal_model_1.default.countDocuments();
        const pendingProposals = await Proposal_model_1.default.countDocuments({ status: 'pending' });
        // 6. Contracts
        const Contract = mongoose_1.default.models.Contract || mongoose_1.default.model('Contract', new mongoose_1.default.Schema({}));
        // Handle case where Contract model might not be registered yet if not imported
        // But usually it is. If not, safe fallback or skip.
        // For now we assume Contract model exists or we skip.
        // simpler:
        const totalContracts = 0; // Placeholder if Contract model not imported in this file
        const activeContracts = 0;
        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalClients,
                totalFreelancers,
                totalJobs,
                activeJobs,
                totalProjects,
                activeProjects,
                completedProjects,
                totalRevenue,
                pendingPayments: pendingPaymentsCount,
                totalProposals,
                pendingProposals
            }
        });
    }
    catch (error) {
        console.error('Error fetching admin dashboard:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getAdminStats = getAdminStats;
// Get Client Dashboard Data
const getClientDashboard = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Get active jobs count
        const activeJobsCount = await Job_model_1.default.countDocuments({
            clientId: userId,
            status: 'active',
        });
        // Get total candidates (applicants across all jobs)
        const totalCandidatesResult = await Job_model_1.default.aggregate([
            { $match: { clientId: new mongoose_1.default.Types.ObjectId(userId) } },
            { $group: { _id: null, total: { $sum: '$applicants' } } },
        ]);
        const totalCandidates = totalCandidatesResult[0]?.total || 0;
        // Get unread messages count
        // Find conversations where user is either client or freelancer
        const conversations = await Conversation_model_1.default.find({
            $or: [
                { clientId: userId },
                { freelancerId: userId },
            ],
        }).select('_id');
        const conversationIds = conversations.map((conv) => conv._id);
        const unreadMessagesCount = await Message_model_1.default.countDocuments({
            conversationId: { $in: conversationIds },
            sender: { $ne: userId },
            isRead: false,
        });
        // Get pending payments (unverified or held in escrow)
        const pendingPaymentsResult = await Payment_model_1.default.aggregate([
            {
                $match: {
                    payerId: new mongoose_1.default.Types.ObjectId(userId),
                    status: { $in: ['pending', 'processing'] }
                }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const pendingPayments = pendingPaymentsResult[0]?.total || 0;
        res.status(200).json({
            activeProjects: activeJobsCount,
            pendingPayments: pendingPayments,
            newMessages: unreadMessagesCount,
        });
    }
    catch (error) {
        console.error('Error fetching client dashboard:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getClientDashboard = getClientDashboard;
// Get Freelancer Dashboard Data
const getFreelancerDashboard = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Get active proposals count (proposals that are not rejected or withdrawn)
        const activeProposalsCount = await Proposal_model_1.default.countDocuments({
            freelancerId: userId,
            status: { $in: ['pending', 'accepted', 'viewed'] },
        });
        // Get completed jobs count (proposals that are approved/completed)
        const completedJobsCount = await Proposal_model_1.default.countDocuments({
            freelancerId: userId,
            status: 'approved', // Assuming 'approved' means completed in this context, or add a 'completed' status
        });
        // Get total earnings from Wallet
        let totalEarnings = 0;
        const wallet = await Wallet_model_1.default.findOne({ userId });
        if (wallet) {
            // Assuming totalEarnings in wallet tracks lifetime earnings, 
            // or we can sum up completed payments if wallet doesn't exist yet/is partial.
            // For now, let's use the Wallet's totalEarnings or sum of completed payments.
            totalEarnings = wallet.totalEarnings || 0;
            // If wallet doesn't track it, fallback to aggregation
            if (totalEarnings === 0) {
                const earningsResult = await Payment_model_1.default.aggregate([
                    {
                        $match: {
                            payeeId: new mongoose_1.default.Types.ObjectId(userId),
                            status: 'completed'
                        }
                    },
                    { $group: { _id: null, total: { $sum: '$netAmount' } } }
                ]);
                totalEarnings = earningsResult[0]?.total || 0;
            }
        }
        else {
            // Fallback if no wallet exists yet
            const earningsResult = await Payment_model_1.default.aggregate([
                {
                    $match: {
                        payeeId: new mongoose_1.default.Types.ObjectId(userId),
                        status: 'completed'
                    }
                },
                { $group: { _id: null, total: { $sum: '$netAmount' } } }
            ]);
            totalEarnings = earningsResult[0]?.total || 0;
        }
        res.status(200).json({
            activeProposals: activeProposalsCount,
            completedJobs: completedJobsCount,
            totalEarnings: totalEarnings,
        });
    }
    catch (error) {
        console.error('Error fetching freelancer dashboard:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getFreelancerDashboard = getFreelancerDashboard;
// Get Top Freelancers (AI-powered recommendations)
const getTopFreelancers = async (req, res) => {
    try {
        // Get freelancers with profiles and high ratings
        const freelancers = await user_model_1.default.find({ userType: 'freelancer' })
            .select('firstName lastName email profileImage jobSuccessScore averageRating totalReviews')
            .sort({ jobSuccessScore: -1, averageRating: -1 })
            .limit(10);
        const freelancersData = freelancers.map((freelancer) => ({
            id: freelancer._id,
            name: `${freelancer.firstName} ${freelancer.lastName}`,
            role: 'Freelancer', // This could come from profile data
            rating: freelancer.averageRating || 0,
            reviews: freelancer.totalReviews || 0,
            jobSuccessScore: freelancer.jobSuccessScore,
            avatar: freelancer.profileImage || `https://ui-avatars.com/api/?name=${freelancer.firstName}+${freelancer.lastName}`,
            skills: freelancer.skills || ['Mobile Dev', 'React Native'] // Fallback
        }));
        res.status(200).json({ freelancers: freelancersData });
    }
    catch (error) {
        console.error('Error fetching freelancers:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getTopFreelancers = getTopFreelancers;
// Get Recent Messages for Dashboard
const getRecentMessages = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Get conversations for the user
        const conversations = await Conversation_model_1.default.find({
            $or: [
                { clientId: userId },
                { freelancerId: userId },
            ],
        })
            .populate('clientId', 'firstName lastName profileImage')
            .populate('freelancerId', 'firstName lastName profileImage')
            .populate('lastMessage')
            .sort({ updatedAt: -1 })
            .limit(3);
        const messagesData = await Promise.all(conversations.map(async (conv) => {
            // Get the other participant (populated or fallback to ObjectId)
            let otherParticipant = null;
            if (conv.clientId && typeof conv.clientId === 'object' && 'firstName' in conv.clientId && conv.clientId._id.toString() !== userId) {
                otherParticipant = conv.clientId;
            }
            else if (conv.freelancerId && typeof conv.freelancerId === 'object' && 'firstName' in conv.freelancerId && conv.freelancerId._id.toString() !== userId) {
                otherParticipant = conv.freelancerId;
            }
            // Check if there are unread messages
            const unreadCount = await Message_model_1.default.countDocuments({
                conversationId: conv._id,
                sender: { $ne: userId },
                isRead: false,
            });
            const lastMsg = conv.lastMessage;
            return {
                id: conv._id,
                name: otherParticipant && otherParticipant.firstName && otherParticipant.lastName
                    ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
                    : 'Unknown',
                message: lastMsg?.text || 'No messages yet',
                time: lastMsg?.createdAt
                    ? formatMessageTime(lastMsg.createdAt)
                    : '',
                unread: unreadCount > 0,
                avatar: (otherParticipant && otherParticipant.profileImage) ||
                    `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
            };
        }));
        res.status(200).json({ messages: messagesData });
    }
    catch (error) {
        console.error('Error fetching recent messages:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getRecentMessages = getRecentMessages;
// Helper function to format message time
const formatMessageTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMs = now.getTime() - messageDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    if (diffInMinutes < 1) {
        return 'Just now';
    }
    else if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
    }
    else if (diffInHours < 24) {
        return `${diffInHours}h ago`;
    }
    else if (diffInDays === 1) {
        return 'Yesterday';
    }
    else if (diffInDays < 7) {
        return `${diffInDays}d ago`;
    }
    else {
        return messageDate.toLocaleDateString();
    }
};
