import { Request, Response } from 'express';
import Message from '../models/Message.model';
import Conversation from '../models/Conversation.model';
import mongoose from 'mongoose';
// Import io from app (singleton pattern)
import { getIO } from '../core/utils/socketIO';

// Get or create conversation between two users
export const getOrCreateConversation = async (req: Request, res: Response) => {
  try {
    const { userId1, userId2, projectId } = req.body;

    if (!userId1 || !userId2) {
      return res.status(400).json({
        success: false,
        message: 'Both user IDs are required',
      });
    }

    // Sort user IDs to ensure consistent conversation lookup
    const participants = [userId1, userId2].sort();

    // Build query - if projectId provided, look for conversation with that project
    const query: any = {
      participants: { $all: participants, $size: 2 },
    };
    
    if (projectId) {
      query.projectId = projectId;
    }

    // Check if conversation exists
    let conversation = await Conversation.findOne(query)
      .populate('participants', 'firstName lastName email')
      .populate('projectId', 'title');

    if (!conversation) {
      // Create new conversation
      const conversationData: any = {
        participants,
        unreadCount: {
          [userId1]: 0,
          [userId2]: 0,
        },
      };
      if (projectId) {
        conversationData.projectId = projectId;
      }
      conversation = await Conversation.create(conversationData);
      conversation = await conversation.populate('participants', 'firstName lastName email');
      if (projectId) {
        conversation = await conversation.populate('projectId', 'title');
      }
      // Emit conversation update to both users
      const io = getIO();
      participants.forEach((userId) => {
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
    const { userId } = req.params;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'firstName lastName email')
      .populate('projectId', 'title')
      .populate('lastMessage')
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
            convObj.lastMessage = lastMsg.text; // Store just the text
            convObj.lastMessageAt = lastMsg.createdAt; // Update timestamp
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
    const { page = 1, limit = 50 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

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
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message,
    });
  }
};

// Send a message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { conversationId, senderId, receiverId, text, attachments } = req.body;

    // Validate required fields (text is optional if attachments exist)
    if (!conversationId || !senderId || !receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID, sender ID, and receiver ID are required',
      });
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
      conversationId,
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
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: messageText,
      lastMessageAt: new Date(),
      $inc: {
        [`unreadCount.${receiverId}`]: 1,
      },
    });

    // Emit conversation update to both users
    const io = getIO();
    [senderId, receiverId].forEach((userId) => {
      io.to(userId).emit('conversation:update');
    });

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
    const { conversationId, userId } = req.body;

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
