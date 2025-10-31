import express from "express";
import {
  getProfileAnalytics,
  getGigPerformance,
  compareSkillsToMarket,
  generateWeeklyReport,
} from "../controllers/insights.controller";

const router = express.Router();

router.get("/profile", getProfileAnalytics);
router.get("/gigs", getGigPerformance);
router.post("/skills/compare", compareSkillsToMarket);
router.get("/reports/weekly", generateWeeklyReport);

export default router;
