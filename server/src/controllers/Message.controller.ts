import { Request, Response } from 'express';
import Message from '../models/Message.model.js';
import Conversation from '../models/Conversation.model.js';
import mongoose from 'mongoose';
// Import io from app (singleton pattern)
import { getIO } from '../core/utils/socketIO.js';
import User from '../models/user.model.js';
import Notification from '../models/Notification.model.js';
import notificationService from '../services/notification.service.js';
// import CollaboWorkspace from '../models/CollaboWorkspace.model.js';

// Get or create conversation between two users
export const getOrCreateConversation = async (req: Request, res: Response) => {
  try {
    const { clientId, freelancerId, projectId, participants } = req.body;
    console.log('getOrCreateConversation payload:', { clientId, freelancerId, projectId, participants });

    // Basic participants validation
    const actualParticipants = participants || (clientId && freelancerId ? [clientId, freelancerId] : []);
    
    if (actualParticipants.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least two participants (or clientId and freelancerId) are required',
      });
    }

    // Find conversation by provided fields or participants
    let query: any = {};
    if (clientId && freelancerId && projectId) {
      query = { clientId, freelancerId, projectId };
    } else {
      query = { participants: { $all: actualParticipants, $size: actualParticipants.length }, projectId: projectId || null };
    }

    let conversation = await Conversation.findOne(query)
      .populate('clientId', 'firstName lastName email')
      .populate('freelancerId', 'firstName lastName email')
      .populate('participants', 'firstName lastName email profileImage avatar isPremium')
      .populate('projectId', 'title');

    if (!conversation) {
      // Create new conversation
      const conversationData: any = {
        participants: actualParticipants,
        unreadCount: {},
      };
      
      if (clientId) conversationData.clientId = clientId;
      if (freelancerId) conversationData.freelancerId = freelancerId;
      if (projectId) conversationData.projectId = projectId;
      
      actualParticipants.forEach((p: string) => {
        conversationData.unreadCount[p] = 0;
      });

      conversation = await Conversation.create(conversationData);
      conversation = await conversation.populate('clientId', 'firstName lastName email');
      conversation = await conversation.populate('freelancerId', 'firstName lastName email');
      conversation = await conversation.populate('projectId', 'title');
      console.log('Created new conversation:', conversation._id?.toString());
      // Emit conversation update to both users
      const io = getIO();
      actualParticipants.forEach((userId: string) => {
        io.to(userId).emit('conversation:update');
      });
    }
    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error getting/creating conversation',
      error: error.message,
    });
  }
};

// Get all conversations for a user
export const getUserConversations = async (req: Request, res: Response) => {
  try {
    let { userId } = req.params;

    if (!userId && (req as any).user) {
      userId = (req as any).user?._id || (req as any).user?.id;
    }

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    // Find conversations where user is either client or freelancer
    // Find conversations where user is a participant
    const conversations = await Conversation.find({
      $or: [
        { clientId: userId },
        { freelancerId: userId },
        { participants: userId }
      ],
    })
      .populate('clientId', 'firstName lastName email profileImage avatar isPremium')
      .populate('freelancerId', 'firstName lastName email profileImage avatar isPremium')
      .populate('participants', 'firstName lastName email profileImage avatar isPremium')
      .populate('projectId', 'title')
      .sort({ lastMessageAt: -1 });

    // For each conversation, get the last message if not populated
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conv) => {
        const convObj = conv.toObject();
        // If lastMessage is not populated, fetch the most recent message
        if (!convObj.lastMessage) {
          const lastMsg = await Message.findOne({ conversationId: conv._id })
            .sort({ createdAt: -1 })
            .limit(1)
            .lean();
          if (lastMsg) {
            convObj.lastMessage = lastMsg.text;
            convObj.lastMessageAt = lastMsg.createdAt;
          }
        }
        return convObj;
      })
    );

    res.status(200).json({
      success: true,
      count: conversationsWithMessages.length,
      data: conversationsWithMessages,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message,
    });
  }
};

// Get messages for a conversation
export const getConversationMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    console.log('[getConversationMessages] conversationId:', conversationId);
    const { page = 1, limit = 50 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'firstName lastName email')
      .populate('receiverId', 'firstName lastName email')
      .sort({ createdAt: 1 })
      .limit(Number(limit))
      .skip(skip);

    console.log('[getConversationMessages] messages found:', messages.length);

    const total = await Message.countDocuments({ conversationId });

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: messages,
    });
  } catch (error: any) {
    console.error('[getConversationMessages] error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message,
    });
  }
};

// Get single conversation details
export const getConversationById = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findById(conversationId)
      .populate('clientId', 'firstName lastName email profileImage avatar isPremium')
      .populate('freelancerId', 'firstName lastName email profileImage avatar isPremium')
      .populate('participants', 'firstName lastName email profileImage avatar isPremium')
      .populate('projectId', 'title');

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    res.status(200).json({ success: true, data: conversation });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching conversation details', error: error.message });
  }
};

// Send a message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    let { conversationId, senderId, receiverId, text, attachments } = req.body;
    const authenticatedUserId = (req as any).user?._id || (req as any).user?.id;

    // Use authenticated user as sender if not provided
    if (!senderId && authenticatedUserId) {
      senderId = authenticatedUserId;
    }

    // Basic validation
    if (!senderId) {
      return res.status(401).json({ success: false, message: 'Authentication required to send message' });
    }

    let targetConversationId = conversationId;

    // If we have conversationId but no receiverId, find receiver from conversation
    if (targetConversationId && !receiverId) {
      const conv = await Conversation.findById(targetConversationId);
      if (conv) {
        receiverId = conv.participants.find(p => p.toString() !== senderId.toString());
      }
    }

    if (!receiverId && !targetConversationId) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID or Receiver ID is required',
      });
    }

    // If no conversationId, find or create one
    if (!targetConversationId) {
      const existingConv = await Conversation.findOne({
        participants: { $all: [senderId, receiverId], $size: 2 }
      });

      if (existingConv) {
        targetConversationId = existingConv._id;
      } else {
        // Create new generic conversation
        const newConv = await Conversation.create({
          participants: [senderId, receiverId],
          unreadCount: { [senderId]: 0, [receiverId]: 0 }
        });
        targetConversationId = newConv._id;
      }
    }

    // Ensure either text or attachments are provided
    if (!text && (!attachments || attachments.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Message must contain either text or attachments',
      });
    }

    // Use text if provided, otherwise create a default text for attachments
    const messageText = text || '📎 Attachment';

    // Create message
    const message = await Message.create({
      conversationId: targetConversationId,
      senderId,
      receiverId,
      text: messageText,
      attachments: attachments || [],
      isRead: false,
    });

    // Populate sender and receiver info
    await message.populate('senderId', 'firstName lastName email');
    await message.populate('receiverId', 'firstName lastName email');

    // Update conversation
    await Conversation.findByIdAndUpdate(targetConversationId, {
      lastMessage: messageText,
      lastMessageAt: new Date(),
      $inc: {
        [`unreadCount.${receiverId}`]: 1,
      },
    });

    // Emit conversation update to both users
    // Emit conversation update to both users
    const io = getIO();
    [senderId, receiverId].forEach((userId) => {
      io.to(userId).emit('conversation:update');
    });

    await notificationService.createNotification({
      userId: receiverId.toString(),
      type: 'message_received',
      title: 'New Message',
      message: `${senderName} sent you a message: "${messageText.substring(0, 50)}${messageText.length > 50 ? '...' : ''}"`,
      relatedId: targetConversationId.toString(),
      relatedType: 'message',
      actorId: senderId.toString(),
      actorName: senderName,
      link: `/messages/${targetConversationId}`,
      shouldSendPush: true,
      shouldSendEmail: true
    });

    // Emit notification event to receiver
    io.to(receiverId).emit('notification:new', {
      title: 'New Message',
      message: `${senderName} sent you a message`,
      type: 'message_received'
    });

    // Send Push Notification
    notificationService.sendPushNotification(
      receiverId,
      'New Message',
      `${senderName}: ${messageText.substring(0, 50)}${messageText.length > 50 ? '...' : ''}`,
      { conversationId: targetConversationId, type: 'message' }
    );

    // Emit message to receiver for real-time chat
    io.to(receiverId).emit('message:receive', message);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message,
    });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req: Request, res: Response) => {
  try {
    let { conversationId, userId } = req.body;
    const authenticatedUserId = (req as any).user?._id || (req as any).user?.id;

    if (!userId && authenticatedUserId) {
      userId = authenticatedUserId;
    }

    if (!conversationId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID and user ID are required',
      });
    }

    // Mark all unread messages in conversation as read
    await Message.updateMany(
      {
        conversationId,
        receiverId: userId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    // Reset unread count for this user
    await Conversation.findByIdAndUpdate(conversationId, {
      [`unreadCount.${userId}`]: 0,
    });

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error marking messages as read',
      error: error.message,
    });
  }
};

// Get messages between two users (by user IDs)
export const getMessagesBetweenUsers = async (req: Request, res: Response) => {
  try {
    const { userId1, userId2 } = req.params;
    const { page = 1, limit = 50 } = req.query;

    if (!userId1 || !userId2) {
      return res.status(400).json({
        success: false,
        message: 'Both user IDs are required',
      });
    }

    // Generate conversation ID from sorted user IDs
    const participants = [userId1, userId2].sort();

    // Find conversation
    const conversation = await Conversation.findOne({
      participants: { $all: participants, $size: 2 },
    });

    if (!conversation) {
      return res.status(200).json({
        success: true,
        count: 0,
        total: 0,
        data: [],
        conversation: null,
      });
    }

    const skip = (Number(page) - 1) * Number(limit);
    const conversationId = (conversation._id as mongoose.Types.ObjectId).toString();

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'firstName lastName email')
      .populate('receiverId', 'firstName lastName email')
      .sort({ createdAt: 1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Message.countDocuments({ conversationId });

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: messages,
      conversation,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message,
    });
  }
};

// Delete a message
export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const message = await Message.findByIdAndDelete(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message,
    });
  }
};

export const summarizeConversation = async (req: Request, res: Response) => {
  try {
    const threadId = req.params.threadId;
    // placeholder: real summarization would call an LLM
    res.json({ success: true, data: { summary: "Short summary..." } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get total unread count for a user
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    // Find all conversations where user is a participant
    const conversations = await Conversation.find({
      $or: [
        { clientId: userId },
        { freelancerId: userId },
        { participants: userId }
      ],
    });

    let totalUnread = 0;
    conversations.forEach((conv: any) => {
      // unreadCount is a Map in the schema
      if (conv.unreadCount) {
        const count = conv.unreadCount.get ? conv.unreadCount.get(userId) : conv.unreadCount[userId];
        totalUnread += Number(count) || 0;
      }
    });

    /*
    // Also check CollaboWorkspaces (DISABLED)
    // We need to find workspaces where the user has an unread count entry
    const collaboWorkspaces = await CollaboWorkspace.find({
      [`unreadCount.${userId}`]: { $gt: 0 }
    });

    collaboWorkspaces.forEach((ws: any) => {
      if (ws.unreadCount) {
        const count = ws.unreadCount.get ? ws.unreadCount.get(userId) : ws.unreadCount[userId];
        totalUnread += Number(count) || 0;
      }
    });
    */

    res.status(200).json({
      success: true,
      data: { unreadCount: totalUnread },
    });
  } catch (error: any) {
    console.error('Error in getUnreadCount:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message,
    });
  }
};
