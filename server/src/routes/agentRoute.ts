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
async function createAgent(userId: string, authToken?: string, userType?: string) {
  await ensureToolsLoaded(); // ensure tools are ready before creating agent

  const agent = new ConnectaAgent({
    apiBaseUrl: "http://localhost:5000",
    authToken: authToken || process.env.CONNECTA_AUTH_TOKEN || "",
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
    const authHeader = (req.headers["authorization"] as string) || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

    console.log("📥 Agent request received:", { input: input?.substring(0, 50), userId, userType });

    if (!input || !userId) {
      return res.status(400).json({
        error: "Missing required fields: 'input' and 'userId' are required.",
      });
    }

    const agent = await createAgent(userId, token, userType);
    const result = await agent.process(input);

    console.log("✅ Agent response:", { success: result.success, hasData: !!result.data });

    return res.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error("❌ Agent error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause,
    });
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
      error: error.message || "Internal Server Error",
    });
  }
});

export default router;
