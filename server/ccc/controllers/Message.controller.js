"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeConversation = exports.deleteMessage = exports.getMessagesBetweenUsers = exports.markMessagesAsRead = exports.sendMessage = exports.getConversationMessages = exports.getUserConversations = exports.getOrCreateConversation = void 0;
const Message_model_1 = __importDefault(require("../models/Message.model"));
const Conversation_model_1 = __importDefault(require("../models/Conversation.model"));
// Import io from app (singleton pattern)
const socketIO_1 = require("../core/utils/socketIO");
// Get or create conversation between two users
const getOrCreateConversation = async (req, res) => {
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
        let conversation = await Conversation_model_1.default.findOne({
            clientId,
            freelancerId,
            projectId,
        })
            .populate('clientId', 'firstName lastName email')
            .populate('freelancerId', 'firstName lastName email')
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
            conversation = await Conversation_model_1.default.create(conversationData);
            conversation = await conversation.populate('clientId', 'firstName lastName email');
            conversation = await conversation.populate('freelancerId', 'firstName lastName email');
            conversation = await conversation.populate('projectId', 'title');
            console.log('Created new conversation:', conversation._id?.toString());
            // Emit conversation update to both users
            const io = (0, socketIO_1.getIO)();
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
exports.getOrCreateConversation = getOrCreateConversation;
// Get all conversations for a user
const getUserConversations = async (req, res) => {
    try {
        const { userId } = req.params;
        // Find conversations where user is either client or freelancer
        const conversations = await Conversation_model_1.default.find({
            $or: [
                { clientId: userId },
                { freelancerId: userId },
            ],
        })
            .populate('clientId', 'firstName lastName email')
            .populate('freelancerId', 'firstName lastName email')
            .populate('projectId', 'title')
            .sort({ lastMessageAt: -1 });
        // For each conversation, get the last message if not populated
        const conversationsWithMessages = await Promise.all(conversations.map(async (conv) => {
            const convObj = conv.toObject();
            // If lastMessage is not populated, fetch the most recent message
            if (!convObj.lastMessage) {
                const lastMsg = await Message_model_1.default.findOne({ conversationId: conv._id })
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
exports.getUserConversations = getUserConversations;
// Get messages for a conversation
const getConversationMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        console.log('[getConversationMessages] conversationId:', conversationId);
        const { page = 1, limit = 50 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const messages = await Message_model_1.default.find({ conversationId })
            .populate('senderId', 'firstName lastName email')
            .populate('receiverId', 'firstName lastName email')
            .sort({ createdAt: 1 })
            .limit(Number(limit))
            .skip(skip);
        console.log('[getConversationMessages] messages found:', messages.length);
        const total = await Message_model_1.default.countDocuments({ conversationId });
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
exports.getConversationMessages = getConversationMessages;
// Send a message
const sendMessage = async (req, res) => {
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
        const message = await Message_model_1.default.create({
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
        await Conversation_model_1.default.findByIdAndUpdate(conversationId, {
            lastMessage: messageText,
            lastMessageAt: new Date(),
            $inc: {
                [`unreadCount.${receiverId}`]: 1,
            },
        });
        // Emit conversation update to both users
        const io = (0, socketIO_1.getIO)();
        [senderId, receiverId].forEach((userId) => {
            io.to(userId).emit('conversation:update');
        });
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
exports.sendMessage = sendMessage;
// Mark messages as read
const markMessagesAsRead = async (req, res) => {
    try {
        const { conversationId, userId } = req.body;
        if (!conversationId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Conversation ID and user ID are required',
            });
        }
        // Mark all unread messages in conversation as read
        await Message_model_1.default.updateMany({
            conversationId,
            receiverId: userId,
            isRead: false,
        }, {
            isRead: true,
            readAt: new Date(),
        });
        // Reset unread count for this user
        await Conversation_model_1.default.findByIdAndUpdate(conversationId, {
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
exports.markMessagesAsRead = markMessagesAsRead;
// Get messages between two users (by user IDs)
const getMessagesBetweenUsers = async (req, res) => {
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
        const conversation = await Conversation_model_1.default.findOne({
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
        const messages = await Message_model_1.default.find({ conversationId })
            .populate('senderId', 'firstName lastName email')
            .populate('receiverId', 'firstName lastName email')
            .sort({ createdAt: 1 })
            .limit(Number(limit))
            .skip(skip);
        const total = await Message_model_1.default.countDocuments({ conversationId });
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
exports.getMessagesBetweenUsers = getMessagesBetweenUsers;
// Delete a message
const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await Message_model_1.default.findByIdAndDelete(id);
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
exports.deleteMessage = deleteMessage;
const summarizeConversation = async (req, res) => {
    try {
        const threadId = req.params.threadId;
        // placeholder: real summarization would call an LLM
        res.json({ success: true, data: { summary: "Short summary..." } });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.summarizeConversation = summarizeConversation;
