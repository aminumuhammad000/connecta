import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { loadTools } from "./core/ai/connecta-agent/tools/index.js";
import { ConnectaAgent } from "./core/ai/connecta-agent/agent.js";

dotenv.config();

const app = express();
const PORT = process.env.AGENT_PORT || 5001;

app.use(cors());
app.use(express.json());

// 🧠 Global init: load tools once when the server starts
let toolsLoaded = false;

async function ensureToolsLoaded() {
    if (!toolsLoaded) {
        await loadTools();
        toolsLoaded = true;
        console.log("✅ Tools successfully loaded for Connecta Agent Server.");
    }
}

interface AgentRequest {
    input: string;
    userId: string;
    userType?: string;
}

// Helper to create agent
async function createAgent(userId: string, authToken?: string) {
    await ensureToolsLoaded();

    // The agent needs to know where the main server is to call its APIs
    const apiBaseUrl = process.env.MAIN_SERVER_URL || "https://api.myconnecta.ng";

    const agent = new ConnectaAgent({
        apiBaseUrl,
        authToken: authToken || "",
        openaiApiKey: process.env.OPENROUTER_API_KEY || "",
        mockMode: false,
        userId,
    });

    await agent.initialize();
    return agent;
}

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "connecta-agent" });
});

// POST /api/agent
app.post("/api/agent", async (req: Request, res: Response) => {
    try {
        const { input, userId, userType } = req.body as AgentRequest;
        const authHeader = (req.headers["authorization"] as string) || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

        console.log("📥 Agent request received:", { input: input?.substring(0, 50), userId });

        if (!input || !userId) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields: 'input' and 'userId' are required.",
            });
        }

        const agent = await createAgent(userId, token);

        // Timeout logic
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("AI Agent Service Timeout")), 30000)
        );

        const result = await Promise.race([
            agent.process(input),
            timeoutPromise
        ]) as any;

        console.log("✅ Agent response generated");

        return res.json({
            success: true,
            result,
        });
    } catch (error: any) {
        console.error("❌ Agent error:", error.message);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Connecta Agent Server running on port ${PORT}`);
    console.log(`🔗 Pointing to Main Server: ${process.env.MAIN_SERVER_URL || "https://api.myconnecta.ng"}`);
});
