"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentMessages = exports.getTopFreelancers = exports.getClientDashboard = void 0;
const Job_model_1 = __importDefault(require("../models/Job.model"));
const Message_model_1 = __importDefault(require("../models/Message.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const Conversation_model_1 = __importDefault(require("../models/Conversation.model"));
const mongoose_1 = __importDefault(require("mongoose"));
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
        res.status(200).json({
            stats: {
                activeJobs: activeJobsCount,
                totalCandidates,
                unreadMessages: unreadMessagesCount,
            },
        });
    }
    catch (error) {
        console.error('Error fetching client dashboard:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getClientDashboard = getClientDashboard;
// Get Top Freelancers (AI-powered recommendations)
const getTopFreelancers = async (req, res) => {
    try {
        // Get freelancers with profiles and high ratings
        const freelancers = await user_model_1.default.find({ userType: 'freelancer' })
            .select('firstName lastName email profileImage')
            .limit(3);
        const freelancersData = freelancers.map((freelancer) => ({
            id: freelancer._id,
            name: `${freelancer.firstName} ${freelancer.lastName}`,
            role: 'Freelancer', // This could come from profile data
            rating: (Math.random() * (5 - 4.5) + 4.5).toFixed(1), // Random rating for now
            avatar: freelancer.profileImage || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
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
