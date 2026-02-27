import { Job } from '../models/Job.model.js';
import Project from '../models/Project.model.js';
import Message from '../models/Message.model.js';
import User from '../models/user.model.js';
import Conversation from '../models/Conversation.model.js';
import Proposal from '../models/Proposal.model.js';
import Payment from '../models/Payment.model.js';
import Wallet from '../models/Wallet.model.js';
import mongoose from 'mongoose';
import CollaboProject from '../models/CollaboProject.model.js';
import Profile from '../models/Profile.model.js';
import Contract from '../models/Contract.model.js';
// Get Admin Dashboard Data
export const getAdminStats = async (req, res) => {
    try {
        // 1. User Stats
        const totalUsers = await User.countDocuments();
        const totalClients = await User.countDocuments({ userType: 'client' });
        const totalFreelancers = await User.countDocuments({ userType: 'freelancer' });
        // 2. Job Stats
        const totalJobs = await Job.countDocuments();
        const activeJobs = await Job.countDocuments({ status: { $in: ['Open', 'open', 'active'] } });
        const pendingJobs = await Job.countDocuments({ status: 'pending' });
        // 3. Project Stats
        const totalProjects = await Project.countDocuments();
        const activeProjects = await Project.countDocuments({ status: { $in: ['ongoing', 'active', 'In-Progress'] } });
        const completedProjects = await Project.countDocuments({ status: 'completed' });
        // 4. Financial Stats
        const revenueResult = await Payment.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;
        const pendingPaymentsCount = await Payment.countDocuments({ status: 'pending' });
        // 5. Proposals
        const totalProposals = await Proposal.countDocuments();
        const pendingProposals = await Proposal.countDocuments({ status: 'pending' });
        // 6. Contracts
        const totalContracts = await Contract.countDocuments();
        const activeContracts = await Contract.countDocuments({ status: 'active' });
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
                pendingProposals,
                pendingJobs
            }
        });
    }
    catch (error) {
        console.error('Error fetching admin dashboard:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
// Get Client Dashboard Data
export const getClientDashboard = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Get active jobs count
        const activeJobsCount = await Job.countDocuments({
            clientId: userId,
            status: { $in: ['active', 'in_progress'] },
        });
        // Get active collabo projects count
        const activeCollaboCount = await CollaboProject.countDocuments({
            clientId: userId,
            status: { $in: ['active', 'planning'] },
        });
        // Get active projects count (from Project model)
        const activeProjectsCount = await Project.countDocuments({
            clientId: userId,
            status: 'ongoing',
        });
        const totalActiveProjects = activeJobsCount + activeCollaboCount + activeProjectsCount;
        // Get unread messages count
        const conversations = await Conversation.find({
            $or: [
                { clientId: userId },
                { freelancerId: userId },
            ],
        }).select('_id');
        const conversationIds = conversations.map((conv) => conv._id);
        const unreadMessagesCount = await Message.countDocuments({
            conversationId: { $in: conversationIds },
            sender: { $ne: userId },
            isRead: false,
        });
        // Get pending payments (unverified or held in escrow)
        const pendingPaymentsResult = await Payment.aggregate([
            {
                $match: {
                    payerId: new mongoose.Types.ObjectId(userId),
                    status: { $in: ['pending', 'processing'] }
                }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const pendingPayments = pendingPaymentsResult[0]?.total || 0;
        // Get total spent (completed payments)
        const totalSpentResult = await Payment.aggregate([
            {
                $match: {
                    payerId: new mongoose.Types.ObjectId(userId),
                    status: 'completed'
                }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalSpent = totalSpentResult[0]?.total || 0;
        res.status(200).json({
            activeProjects: totalActiveProjects,
            pendingPayments: pendingPayments,
            newMessages: unreadMessagesCount,
            totalSpent: totalSpent
        });
    }
    catch (error) {
        console.error('Error fetching client dashboard:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
// Get Active Projects for Client Dashboard
export const getActiveProjects = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // 1. Fetch active jobs
        const activeJobs = await Job.find({
            clientId: userId,
            status: { $in: ['active', 'in_progress'] },
        }).sort({ createdAt: -1 });
        // 2. Fetch active collabo projects
        const activeCollabos = await CollaboProject.find({
            clientId: userId,
            status: { $in: ['active', 'planning'] },
        }).sort({ createdAt: -1 });
        // 3. Fetch ongoing projects (from Project model)
        const ongoingProjects = await Project.find({
            clientId: userId,
            status: 'ongoing',
        }).sort({ createdAt: -1 });
        // Combine and format
        const allActiveProjects = [
            ...activeJobs.map(job => ({
                _id: job._id,
                title: job.title,
                description: job.description,
                status: job.status,
                budget: job.budget,
                createdAt: job.createdAt,
                projectType: 'job'
            })),
            ...activeCollabos.map(collabo => ({
                _id: collabo._id,
                title: collabo.title,
                description: collabo.description,
                status: collabo.status,
                budget: collabo.totalBudget,
                teamName: collabo.teamName,
                createdAt: collabo.createdAt,
                projectType: 'collabo'
            })),
            ...ongoingProjects.map(project => ({
                _id: project._id,
                title: project.title,
                description: project.description,
                status: project.status,
                budget: project.budget?.amount,
                createdAt: project.createdAt,
                projectType: 'project'
            }))
        ];
        // Sort by date
        allActiveProjects.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
        });
        res.status(200).json({
            success: true,
            data: allActiveProjects
        });
    }
    catch (error) {
        console.error('Error fetching active projects:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
// Get Freelancer Dashboard Data
export const getFreelancerDashboard = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Get active proposals count (proposals that are not rejected or withdrawn)
        const activeProposalsCount = await Proposal.countDocuments({
            freelancerId: userId,
            status: { $in: ['pending', 'accepted', 'viewed'] },
        });
        // Get completed jobs count (proposals that are approved/completed)
        const completedJobsCount = await Proposal.countDocuments({
            freelancerId: userId,
            status: 'approved', // Assuming 'approved' means completed in this context, or add a 'completed' status
        });
        // Get total earnings from Wallet
        let totalEarnings = 0;
        const wallet = await Wallet.findOne({ userId });
        if (wallet) {
            // Assuming totalEarnings in wallet tracks lifetime earnings, 
            // or we can sum up completed payments if wallet doesn't exist yet/is partial.
            // For now, let's use the Wallet's totalEarnings or sum of completed payments.
            totalEarnings = wallet.totalEarnings || 0;
            // If wallet doesn't track it, fallback to aggregation
            if (totalEarnings === 0) {
                const earningsResult = await Payment.aggregate([
                    {
                        $match: {
                            payeeId: new mongoose.Types.ObjectId(userId),
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
            const earningsResult = await Payment.aggregate([
                {
                    $match: {
                        payeeId: new mongoose.Types.ObjectId(userId),
                        status: 'completed'
                    }
                },
                { $group: { _id: null, total: { $sum: '$netAmount' } } }
            ]);
            totalEarnings = earningsResult[0]?.total || 0;
        }
        // Get total projects (engagements) - where status is accepted, active, or completed
        const totalProjectsCount = await Proposal.countDocuments({
            freelancerId: userId,
            status: { $in: ['accepted', 'active', 'in_progress', 'approved', 'completed'] },
        });
        // Get unread messages count
        const conversations = await Conversation.find({
            $or: [
                { clientId: userId },
                { freelancerId: userId },
            ],
        }).select('_id');
        const conversationIds = conversations.map((conv) => conv._id);
        const unreadMessagesCount = await Message.countDocuments({
            conversationId: { $in: conversationIds },
            sender: { $ne: userId },
            isRead: false,
        });
        res.status(200).json({
            activeProposals: activeProposalsCount,
            completedJobs: completedJobsCount,
            totalEarnings: totalEarnings,
            totalProjects: totalProjectsCount,
            newMessages: unreadMessagesCount,
        });
    }
    catch (error) {
        console.error('Error fetching freelancer dashboard:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
// Get Top Freelancers (AI-powered recommendations)
export const getTopFreelancers = async (req, res) => {
    try {
        const userId = req.user?.id;
        // 1. Check for active job to personalize
        let matchQuery = {};
        if (userId) {
            const latestJob = await Job.findOne({
                clientId: userId,
                status: { $in: ['active', 'open'] }
            }).sort({ createdAt: -1 });
            if (latestJob) {
                const skills = latestJob.skills || [];
                const category = latestJob.category;
                if (skills.length > 0 || category) {
                    matchQuery = {
                        $or: [
                            { skills: { $in: skills } },
                            { jobCategories: category }
                        ]
                    };
                }
            }
        }
        // 2. Find Profiles matching criteria
        // We limit to 20 to allow for filtering
        let profiles = [];
        if (Object.keys(matchQuery).length > 0) {
            profiles = await Profile.find(matchQuery)
                .populate({
                path: 'user',
                match: { userType: 'freelancer' },
                select: 'firstName lastName email profileImage jobSuccessScore averageRating totalReviews'
            })
                .limit(20);
            // Filter out where user is null (mismatch or not freelancer)
            profiles = profiles.filter(p => p.user);
        }
        // 3. Fallback if no matches or new client
        if (profiles.length < 5) {
            // Fetch top rated freelancers to fill the gap
            const excludeIds = profiles.map(p => p.user._id);
            const topUsers = await User.find({
                userType: 'freelancer',
                _id: { $nin: excludeIds }
            })
                .sort({ jobSuccessScore: -1, averageRating: -1 })
                .limit(10);
            const topProfiles = await Profile.find({ user: { $in: topUsers.map(u => u._id) } })
                .populate('user', 'firstName lastName email profileImage jobSuccessScore averageRating totalReviews');
            // Filter out any null users again just in case
            const validTopProfiles = topProfiles.filter(p => p.user);
            profiles = [...profiles, ...validTopProfiles];
        }
        // 4. Sort by relevance (if matched) or rating
        // Simple sort: Job Success Score descending
        profiles.sort((a, b) => {
            const userA = a.user;
            const userB = b.user;
            return (userB.jobSuccessScore || 0) - (userA.jobSuccessScore || 0);
        });
        // Deduplicate just in case
        const uniqueProfiles = Array.from(new Map(profiles.map(p => {
            const userIdStr = p.user?._id ? p.user._id.toString() : p.user?.toString();
            return [userIdStr, p];
        })).values());
        // 5. Map to response
        const freelancersData = uniqueProfiles.slice(0, 10).map((p) => {
            const u = p.user;
            // Ensure we have user data
            if (!u)
                return null;
            const firstName = u.firstName || 'Unknown';
            const lastName = u.lastName || '';
            const fullName = `${firstName} ${lastName}`.trim();
            return {
                id: u._id || p.user,
                firstName: firstName,
                lastName: lastName,
                name: fullName,
                role: p.jobTitle || 'Freelancer',
                rating: u.averageRating || 0,
                reviews: u.totalReviews || 0,
                jobSuccessScore: u.jobSuccessScore,
                hourlyRate: p.hourlyRate, // Ensure hourlyRate is passed
                avatar: u.profileImage || p.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}`,
                skills: p.skills || [],
                location: p.location
            };
        }).filter(Boolean); // Remove nulls
        res.status(200).json({ success: true, data: freelancersData });
    }
    catch (error) {
        console.error('Error fetching freelancers:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
// Get Recent Messages for Dashboard
export const getRecentMessages = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Get conversations for the user
        const conversations = await Conversation.find({
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
            const unreadCount = await Message.countDocuments({
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
        res.status(200).json({ success: true, data: messagesData });
    }
    catch (error) {
        console.error('Error fetching recent messages:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
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
