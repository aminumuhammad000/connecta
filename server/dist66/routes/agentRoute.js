// src/routes/agent.routes.ts
import { Router } from "express";
import { loadTools } from "../core/ai/connecta-agent/tools";
import { ConnectaAgent } from "../core/ai/connecta-agent/agent";
import { getApiKeys } from "../services/apiKeys.service";
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
// Helper to create agent
async function createAgent(userId, authToken, userType) {
    await ensureToolsLoaded(); // ensure tools are ready before creating agent
    const apiKeys = await getApiKeys();
    const agent = new ConnectaAgent({
        apiBaseUrl: `http://localhost:${process.env.PORT || 5000}`,
        authToken: authToken || process.env.CONNECTA_AUTH_TOKEN || "",
        openaiApiKey: apiKeys.openrouter || process.env.OPENROUTER_API_KEY || "fallback-api-key",
        mockMode: false,
        userId,
    });
    await agent.initialize(); // Initialize agent (fetches settings and sets up model)
    return agent;
}
// POST /api/agent
router.post("/", async (req, res) => {
    try {
        const { input, userId, userType } = req.body;
        const authHeader = req.headers["authorization"] || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
        console.log("📥 Agent request received:", { input: input?.substring(0, 50), userId, userType });
        if (!input || !userId) {
            return res.status(400).json({
                error: "Missing required fields: 'input' and 'userId' are required.",
            });
        }
        const agent = await createAgent(userId, token, userType);
        // Add timeout to prevent hanging requests
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("AI Service Timeout")), 25000) // 25s timeout
        );
        const result = await Promise.race([
            agent.process(input),
            timeoutPromise
        ]);
        console.log("✅ Agent response:", { success: result.success, hasData: !!result.data });
        return res.json({
            success: true,
            result,
        });
    }
    catch (error) {
        console.error("❌ Agent error:", {
            message: error.message,
            stack: error.stack,
            name: error.name,
            cause: error.cause,
        });
        let errorMessage = error.message || "Internal Server Error";
        if (errorMessage.includes("Gemini") || errorMessage.includes("API configuration") || errorMessage.includes("Timeout")) {
            errorMessage = "I'm having a temporary connection issue. Please try again in a moment.";
        }
        return res.status(500).json({
            success: false,
            message: errorMessage,
            error: errorMessage,
        });
    }
});
export default router;
