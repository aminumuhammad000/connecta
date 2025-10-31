import { Request, Response } from "express";

export const explainFeature = async (req: Request, res: Response) => {
  try {
    const { feature } = req.body;
    // respond with faq content or dynamic explanation
    res.json({ success: true, data: { explanation: `Explanation for ${feature}` } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getHelp = async (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: { faq: [] } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const sendFeedback = async (req: Request, res: Response) => {
  try {
    const { userId, feedback } = req.body;
    // persist feedback
    res.json({ success: true, data: { saved: true } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const onboarding = async (req: Request, res: Response) => {
  try {
    const { step, userId } = req.body;
    res.json({ success: true, data: { step, next: "..." } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
