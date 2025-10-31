import { Request, Response } from "express";
import Message from "../models/Message.model";

export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const messages = await Message.find({ $or: [{ senderId: userId }, { receiverId: userId }] }).limit(200);
    res.json({ success: true, data: messages });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId, content } = req.body;
    const msg = await Message.create({ senderId, receiverId, content });
    res.json({ success: true, data: msg });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
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
