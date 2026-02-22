// src/routes/agent.routes.ts
import { Router } from "express";
import axios from "axios";
import User from "../models/user.model.js";
const router = Router();
// This route now proxies requests to the standalone agent server
router.post("/", async (req, res) => {
    try {
        const { input, userId, userType } = req.body;
        const authHeader = req.headers["authorization"] || "";
        // Require User model to check sparks
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        // Enforce spark balance requirement for AI services
        if ((user.sparks || 0) <= 0) {
            return res.status(403).json({
                success: false,
                message: "You need Sparks to use Connecta AI. Please claim your daily reward or complete your profile to earn sparks."
            });
        }
        const AGENT_SERVER_URL = process.env.AGENT_SERVER_URL || "http://localhost:5001";
        console.log("🔀 Proxying agent request to standalone server...");
        const response = await axios.post(`${AGENT_SERVER_URL}/api/agent`, {
            input,
            userId,
            userType
        }, {
            headers: {
                "Authorization": authHeader,
                "Content-Type": "application/json"
            },
            timeout: 35000 // Slightly longer than agent timeout
        });
        return res.json(response.data);
    }
    catch (error) {
        console.error("❌ Proxy error to Agent Server:", error.message);
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || "AI Agent Service is temporarily unavailable.";
        return res.status(status).json({
            success: false,
            message,
            error: message
        });
    }
});
export default router;
