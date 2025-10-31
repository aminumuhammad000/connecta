import express from "express";
import { getMessages, sendMessage, summarizeConversation } from "../controllers/message.controller";

const router = express.Router();

router.get("/:userId", getMessages);
router.post("/send", sendMessage);
router.get("/thread/:threadId/summarize", summarizeConversation);

export default router;
