import express from 'express';
import {
  getOrCreateConversation,
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  getMessagesBetweenUsers,
  deleteMessage,
} from '../controllers/Message.controller';
import { summarizeConversation } from '../controllers/message.controller';

const router = express.Router();

// Conversation routes
router.post('/conversations', getOrCreateConversation);
router.get('/conversations/:userId', getUserConversations);
router.get('/conversations/:conversationId/messages', getConversationMessages);

// Extra route used by agent
router.get('/thread/:threadId/summarize', summarizeConversation);

// Message routes
router.get('/between/:userId1/:userId2', getMessagesBetweenUsers);
router.post('/', sendMessage);
router.patch('/read', markMessagesAsRead);
router.delete('/:id', deleteMessage);

export default router;
