import Message from '../models/Message.model';
import Conversation from '../models/Conversation.model';
import mongoose from 'mongoose';
// Import io from app (singleton pattern)
import { getIO } from '../core/utils/socketIO';
// Get or create conversation between two users
export const getOrCreateConversation = async (req, res) => {
    try {
        const { clientId, freelancerId, projectId } = req.body;
        console.log('getOrCreateConversation payload:', { clientId, freelancerId, projectId });
        if (!clientId || !freelancerId || !projectId) {
            return res.status(400).json({
                success: false,
                message: 'clientId, freelancerId, and projectId are required',
            });
        }
        // Find conversation by all three fields
        let conversation = await Conversation.findOne({
            clientId,
            freelancerId,
            projectId,
        })
            .populate('clientId', 'firstName lastName email')
            .populate('freelancerId', 'firstName lastName email')
            .populate('participants', 'firstName lastName email profileImage avatar isPremium')
            .populate('projectId', 'title');
        if (!conversation) {
            // Create new conversation
            const conversationData = {
                clientId,
                freelancerId,
                projectId,
                unreadCount: {
                    [clientId]: 0,
                    [freelancerId]: 0,
                },
            };
            conversation = await Conversation.create(conversationData);
            conversation = await conversation.populate('clientId', 'firstName lastName email');
            conversation = await conversation.populate('freelancerId', 'firstName lastName email');
            conversation = await conversation.populate('projectId', 'title');
            console.log('Created new conversation:', conversation._id?.toString());
            // Emit conversation update to both users
            const io = getIO();
            [clientId, freelancerId].forEach((userId) => {
                io.to(userId).emit('conversation:update');
            });
        }
        res.status(200).json({
            success: true,
            data: conversation,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting/creating conversation',
            error: error.message,
        });
    }
};
// Get all conversations for a user
export const getUserConversations = async (req, res) => {
    try {
        const { userId } = req.params;
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
        const conversationsWithMessages = await Promise.all(conversations.map(async (conv) => {
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
        }));
        res.status(200).json({
            success: true,
            count: conversationsWithMessages.length,
            data: conversationsWithMessages,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching conversations',
            error: error.message,
        });
    }
};
// Get messages for a conversation
export const getConversationMessages = async (req, res) => {
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
    }
    catch (error) {
        console.error('[getConversationMessages] error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching messages',
            error: error.message,
        });
    }
};
// Send a message
export const sendMessage = async (req, res) => {
    try {
        const { conversationId, senderId, receiverId, text, attachments } = req.body;
        // Validate required fields (text is optional if attachments exist)
        // Validate required fields
        if ((!conversationId && (!senderId || !receiverId)) || (!senderId || !receiverId)) {
            return res.status(400).json({
                success: false,
                message: 'Conversation ID (or sender+receiver ID) is required',
            });
        }
        let targetConversationId = conversationId;
        // If no conversationId, find or create one
        if (!targetConversationId) {
            const existingConv = await Conversation.findOne({
                participants: { $all: [senderId, receiverId], $size: 2 }
            });
            if (existingConv) {
                targetConversationId = existingConv._id;
            }
            else {
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
        // Create notification for receiver
        const sender = await mongoose.model('User').findById(senderId).select('firstName lastName');
        const senderName = sender ? `${sender.firstName} ${sender.lastName}` : 'Someone';
        await mongoose.model('Notification').create({
            userId: receiverId,
            type: 'message_received',
            title: 'New Message',
            message: `${senderName} sent you a message`,
            relatedId: targetConversationId,
            relatedType: 'message',
            actorId: senderId,
            actorName: senderName,
            isRead: false,
        });
        // Emit notification event to receiver
        io.to(receiverId).emit('notification:new', {
            title: 'New Message',
            message: `${senderName} sent you a message`,
            type: 'message_received'
        });
        // Send Push Notification
        const notificationService = (await import('../services/notification.service')).default;
        notificationService.sendPushNotification(receiverId, 'New Message', `${senderName}: ${messageText.substring(0, 50)}${messageText.length > 50 ? '...' : ''}`, { conversationId: targetConversationId, type: 'message' });
        // Emit message to receiver for real-time chat
        io.to(receiverId).emit('message:receive', message);
        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: message,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error sending message',
            error: error.message,
        });
    }
};
// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
    try {
        const { conversationId, userId } = req.body;
        if (!conversationId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Conversation ID and user ID are required',
            });
        }
        // Mark all unread messages in conversation as read
        await Message.updateMany({
            conversationId,
            receiverId: userId,
            isRead: false,
        }, {
            isRead: true,
            readAt: new Date(),
        });
        // Reset unread count for this user
        await Conversation.findByIdAndUpdate(conversationId, {
            [`unreadCount.${userId}`]: 0,
        });
        res.status(200).json({
            success: true,
            message: 'Messages marked as read',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error marking messages as read',
            error: error.message,
        });
    }
};
// Get messages between two users (by user IDs)
export const getMessagesBetweenUsers = async (req, res) => {
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
        const conversationId = conversation._id.toString();
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching messages',
            error: error.message,
        });
    }
};
// Delete a message
export const deleteMessage = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting message',
            error: error.message,
        });
    }
};
export const summarizeConversation = async (req, res) => {
    try {
        const threadId = req.params.threadId;
        // placeholder: real summarization would call an LLM
        res.json({ success: true, data: { summary: "Short summary..." } });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
// Get total unread count for a user
export const getUnreadCount = async (req, res) => {
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
        conversations.forEach((conv) => {
            // unreadCount is a Map in the schema
            if (conv.unreadCount) {
                const count = conv.unreadCount.get ? conv.unreadCount.get(userId) : conv.unreadCount[userId];
                totalUnread += Number(count) || 0;
            }
        });
        // Also check CollaboWorkspaces
        // We need to find workspaces where the user has an unread count entry
        // Since unreadCount is a Map, we can't easily query keys in MongoDB directly without knowing the key
        // But we can find workspaces where `unreadCount.userId` exists and is > 0
        const CollaboWorkspace = mongoose.model('CollaboWorkspace');
        const collaboWorkspaces = await CollaboWorkspace.find({
            [`unreadCount.${userId}`]: { $gt: 0 }
        });
        collaboWorkspaces.forEach((ws) => {
            if (ws.unreadCount) {
                const count = ws.unreadCount.get ? ws.unreadCount.get(userId) : ws.unreadCount[userId];
                totalUnread += Number(count) || 0;
            }
        });
        res.status(200).json({
            success: true,
            data: { unreadCount: totalUnread },
        });
    }
    catch (error) {
        console.error('Error in getUnreadCount:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching unread count',
            error: error.message,
        });
    }
};
