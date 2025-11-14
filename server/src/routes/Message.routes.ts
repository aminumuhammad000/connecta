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
} from '../controllers/Message.controller';

const router = express.Router();

// Conversation routes
router.post('/conversations', getOrCreateConversation);
router.get('/user/:userId/conversations', getUserConversations); // Get all conversations for a user
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
