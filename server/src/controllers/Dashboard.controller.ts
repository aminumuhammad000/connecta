import { Request, Response } from 'express';
import Job from '../models/Job.model';
import Project from '../models/Project.model';
import Message from '../models/Message.model';
import User from '../models/user.model';
import Conversation from '../models/Conversation.model';
import mongoose from 'mongoose';

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

    res.status(200).json({
      stats: {
        activeJobs: activeJobsCount,
        totalCandidates,
        unreadMessages: unreadMessagesCount,
      },
    });
  } catch (error) {
    console.error('Error fetching client dashboard:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get Top Freelancers (AI-powered recommendations)
export const getTopFreelancers = async (req: Request, res: Response) => {
  try {
    // Get freelancers with profiles and high ratings
    const freelancers = await User.find({ userType: 'freelancer' })
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

    res.status(200).json({ messages: messagesData });
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
