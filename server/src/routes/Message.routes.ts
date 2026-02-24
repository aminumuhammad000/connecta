import express from 'express';
import {
  getOrCreateConversation,
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  getMessagesBetweenUsers,
  deleteMessage,
  summarizeConversation,
  getUnreadCount,
} from '../controllers/Message.controller.js';

import { authenticate } from '../core/middleware/auth.middleware.js';

const router = express.Router();

// Authenticated unread-count (userId from token)
router.get('/unread-count', authenticate, async (req: any, res) => {
  const userId = req.user?._id || req.user?.id;
  console.log(`[MessageRoutes] GET /unread-count for user: ${userId}`);
  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

  // Set req.params.userId for getUnreadCount controller
  req.params = { ...req.params, userId: userId.toString() };
  return getUnreadCount(req, res);
});

// Conversation routes
router.post('/conversations', getOrCreateConversation);
router.get('/user/:userId/conversations', getUserConversations); // Get all conversations for a user
router.get('/unread-count/:userId', getUnreadCount); // Legacy: unread count by URL userId
router.get('/conversations/:userId', getUserConversations); // Legacy route
router.get('/conversations/:conversationId/messages', getConversationMessages);

// Extra route used by agent
router.get('/thread/:threadId/summarize', summarizeConversation);

// Message routes
router.get('/between/:userId1/:userId2', getMessagesBetweenUsers);
router.post('/', sendMessage);
router.patch('/read', markMessagesAsRead);
router.delete('/:id', deleteMessage);

export default router;
