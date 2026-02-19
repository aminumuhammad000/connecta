
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { NotFoundError, BadRequestError } from '@connecta/common';
import { Message } from '../models/message.model';
import { Conversation } from '../models/conversation.model';

const router = express.Router();

// [GET] /conversations - List all conversations for user
router.get('/conversations', async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;

    const conversations = await Conversation.find({
        participants: userId,
        isArchived: false
    }).sort({ updatedAt: -1 });

    res.status(200).send({
        success: true,
        message: 'Conversations retrieved successfully',
        data: conversations
    });
});

// [GET] /conversations/:id - Conversation details (messages)
router.get('/conversations/:id', async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const conversation = await Conversation.findOne({
        _id: req.params.id,
        participants: userId
    });

    if (!conversation) throw new NotFoundError();

    const messages = await Message.find({
        conversationId: conversation._id,
        deletedAt: null
    }).sort({ createdAt: 1 });

    res.status(200).send({
        success: true,
        message: 'Messages retrieved successfully',
        data: {
            conversation,
            messages
        }
    });
});

// [POST] /message/send
router.post('/message/send', [
    body('conversationId').notEmpty().withMessage('Conversation ID is required'),
    body('content').notEmpty().withMessage('Content is required')
], async (req: Request, res: Response) => {
    const senderId = req.headers['x-user-id'] as string;
    const { conversationId, content, messageType, attachments } = req.body;

    const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: senderId
    });

    if (!conversation) throw new BadRequestError('Invalid conversation');

    const message = new Message({
        conversationId,
        senderId,
        content,
        messageType: messageType || 'text',
        attachments: attachments || []
    });

    await message.save();

    conversation.lastMessage = content;
    await conversation.save();

    res.status(201).send({
        success: true,
        message: 'Message sent',
        data: message
    });
});

// [POST] /conversations/:id/archive
router.post('/conversations/:id/archive', async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const conversation = await Conversation.findOne({
        _id: req.params.id,
        participants: userId
    });

    if (!conversation) throw new NotFoundError();

    conversation.isArchived = true;
    await conversation.save();

    res.status(200).send({
        success: true,
        message: 'Conversation archived',
        data: {}
    });
});

export { router as chatRouter };
