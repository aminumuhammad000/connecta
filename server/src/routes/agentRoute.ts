import { Router, Request, Response } from "express";
import { ConnectaAgent } from "../core/ai/connecta-agent/agent"; // adjust the path if needed

const router = Router();

interface AgentRequest {
  input: string;
  userId: string;
  userType?: string;
}

// Helper to create agent
function createAgent(userId: string, userType?: string) {
  return new ConnectaAgent({
    apiBaseUrl: "http://localhost:5000",
    authToken: "test-auth-token",
    openaiApiKey: process.env.OPENROUTER_API_KEY || "fallback-api-key",
    mockMode: false,
    userId,
  });
}

// POST /api/agent
router.post("/", async (req: Request, res: Response) => {
  try {
    const { input, userId, userType } = req.body as AgentRequest;

    if (!input || !userId) {
      return res.status(400).json({
        error: "Missing required fields: 'input' and 'userId' are required.",
      });
    }

    const agent = createAgent(userId, userType);
    const result = await agent.process(input);

    return res.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error("❌ Agent error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal Server Error",
    });
  }
});

export default router;
