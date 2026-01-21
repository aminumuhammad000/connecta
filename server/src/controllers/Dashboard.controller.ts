import { Request, Response } from 'express';
import Job from '../models/Job.model';
import Project from '../models/Project.model';
import Message from '../models/Message.model';
import User from '../models/user.model';
import Conversation from '../models/Conversation.model';
import Proposal from '../models/Proposal.model';
import Payment from '../models/Payment.model';
import Wallet from '../models/Wallet.model';
import mongoose from 'mongoose';

// Get Admin Dashboard Data
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    // 1. User Stats
    const totalUsers = await User.countDocuments();
    const totalClients = await User.countDocuments({ userType: 'client' });
    const totalFreelancers = await User.countDocuments({ userType: 'freelancer' });

    // 2. Job Stats
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: { $in: ['Open', 'open', 'active'] } });

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
    const Contract = mongoose.models.Contract || mongoose.model('Contract', new mongoose.Schema({}));
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

  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get Client Dashboard Data
export const getClientDashboard = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get active jobs count
    const activeJobsCount = await Job.countDocuments({
      clientId: userId,
      status: 'active',
    });

    // Get total candidates (applicants across all jobs)
    const totalCandidatesResult = await Job.aggregate([
      { $match: { clientId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$applicants' } } },
    ]);
    const totalCandidates = totalCandidatesResult[0]?.total || 0;

    // Get unread messages count

    // Find conversations where user is either client or freelancer
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

    res.status(200).json({
      activeProjects: activeJobsCount,
      pendingPayments: pendingPayments,
      newMessages: unreadMessagesCount,
    });
  } catch (error) {
    console.error('Error fetching client dashboard:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get Freelancer Dashboard Data
export const getFreelancerDashboard = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

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
    } else {
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

    res.status(200).json({
      activeProposals: activeProposalsCount,
      completedJobs: completedJobsCount,
      totalEarnings: totalEarnings,
    });
  } catch (error) {
    console.error('Error fetching freelancer dashboard:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get Top Freelancers (AI-powered recommendations)
export const getTopFreelancers = async (req: Request, res: Response) => {
  try {
    // Get freelancers with profiles and high ratings
    const freelancers = await User.find({ userType: 'freelancer' })
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
      skills: (freelancer as any).skills || ['Mobile Dev', 'React Native'] // Fallback
    }));

    res.status(200).json({ success: true, data: freelancersData });
  } catch (error) {
    console.error('Error fetching freelancers:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get Recent Messages for Dashboard
export const getRecentMessages = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

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


    const messagesData = await Promise.all(
      conversations.map(async (conv) => {
        // Get the other participant (populated or fallback to ObjectId)
        let otherParticipant: any = null;
        if (conv.clientId && typeof conv.clientId === 'object' && 'firstName' in conv.clientId && conv.clientId._id.toString() !== userId) {
          otherParticipant = conv.clientId;
        } else if (conv.freelancerId && typeof conv.freelancerId === 'object' && 'firstName' in conv.freelancerId && conv.freelancerId._id.toString() !== userId) {
          otherParticipant = conv.freelancerId;
        }

        // Check if there are unread messages
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          sender: { $ne: userId },
          isRead: false,
        });

        const lastMsg = conv.lastMessage as any;

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
          avatar:
            (otherParticipant && otherParticipant.profileImage) ||
            `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
        };
      })
    );

    res.status(200).json({ success: true, data: messagesData });
  } catch (error) {
    console.error('Error fetching recent messages:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Helper function to format message time
const formatMessageTime = (date: Date): string => {
  const now = new Date();
  const messageDate = new Date(date);
  const diffInMs = now.getTime() - messageDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return messageDate.toLocaleDateString();
  }
};
