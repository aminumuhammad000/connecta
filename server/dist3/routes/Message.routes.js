"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Message_controller_1 = require("../controllers/Message.controller");
const router = express_1.default.Router();
// Conversation routes
router.post('/conversations', Message_controller_1.getOrCreateConversation);
router.get('/user/:userId/conversations', Message_controller_1.getUserConversations); // Get all conversations for a user
router.get('/conversations/:userId', Message_controller_1.getUserConversations); // Legacy route
router.get('/conversations/:conversationId/messages', Message_controller_1.getConversationMessages);
// Extra route used by agent
router.get('/thread/:threadId/summarize', Message_controller_1.summarizeConversation);
// Message routes
router.get('/between/:userId1/:userId2', Message_controller_1.getMessagesBetweenUsers);
router.post('/', Message_controller_1.sendMessage);
router.patch('/read', Message_controller_1.markMessagesAsRead);
router.delete('/:id', Message_controller_1.deleteMessage);
exports.default = router;
