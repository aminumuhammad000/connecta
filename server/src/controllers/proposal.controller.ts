import { Request, Response } from "express";
import Proposal from "../models/Proposal.model";

export const createCoverLetter = async (req: Request, res: Response) => {
  try {
    const { jobTitle, inputs } = req.body;
    // Ideally call an internal text-generation service or use an LLM in backend
    const generated = `Dear Hiring Manager,\n\nI am excited about ${jobTitle}...`;
    res.json({ success: true, data: { coverLetter: generated } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const editCoverLetter = async (req: Request, res: Response) => {
  try {
    const { coverLetterId, edits } = req.body;
    // fetch & update
    res.json({ success: true, data: { edited: true } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const saveCoverLetter = async (req: Request, res: Response) => {
  try {
    const { userId, coverLetter } = req.body;
    const saved = await Proposal.create({ user: userId, content: coverLetter });
    res.json({ success: true, data: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSavedCoverLetters = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const items = await Proposal.find({ user: userId });
    res.json({ success: true, data: items });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
