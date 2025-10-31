// src/routes/agent.routes.ts
import { Router, Request, Response } from "express";
import { loadTools } from "../core/ai/connecta-agent/tools";
import { ConnectaAgent } from "../core/ai/connecta-agent/agent";

const router = Router();

// 🧠 Global init: load tools once when the server starts
let toolsLoaded = false;

async function ensureToolsLoaded() {
  if (!toolsLoaded) {
    await loadTools();
    toolsLoaded = true;
    console.log("✅ Tools successfully loaded for Connecta Agent.");
  }
}

interface AgentRequest {
  input: string;
  userId: string;
  userType?: string;
}

// Helper to create agent
async function createAgent(userId: string, userType?: string) {
  await ensureToolsLoaded(); // ensure tools are ready before creating agent

  const agent = new ConnectaAgent({
    apiBaseUrl: "http://localhost:5000",
    authToken: "test-auth-token",
    openaiApiKey: process.env.OPENROUTER_API_KEY || "fallback-api-key",
    mockMode: false,
    userId,
  });

  await agent.initializeTools(); // populate toolMap dynamically
  return agent;
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

    const agent = await createAgent(userId, userType);
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
