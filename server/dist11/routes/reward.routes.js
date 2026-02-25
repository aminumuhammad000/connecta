import express from "express";
import { claimDailyReward, getSparkHistory, getSparkStats } from "../controllers/user.controller.js";
import { authenticate } from "../core/middleware/auth.middleware.js";
const router = express.Router();
// Matches `/api/rewards/claim` from mobile app
router.post("/claim", authenticate, claimDailyReward);
// Matches `/api/rewards/balance` (using spark-stats or similar)
router.get("/balance", authenticate, getSparkStats);
// Matches `/api/rewards/history` from mobile app
router.get("/history", authenticate, getSparkHistory);
export default router;
