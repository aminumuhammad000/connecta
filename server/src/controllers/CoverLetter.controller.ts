import { Request, Response } from "express";

export const generateCoverLetter = async (req: Request, res: Response) => {
  try {
    const { position, company, highlights } = req.body;

    // Simple mock (you can later connect to OpenAI or your AI agent here)
    const coverLetter = `
Dear Hiring Manager,

I am excited to apply for the ${position}${company ? ` position at ${company}` : ""}.
${highlights?.length ? `Here are some highlights:\n- ${highlights.join("\n- ")}` : ""}
I believe my experience and passion make me a great fit.

Best regards,
[Your Name]
    `;

    return res.status(200).json({
      success: true,
      message: "Cover letter generated successfully",
      data: { coverLetter },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate cover letter",
    });
  }
};
