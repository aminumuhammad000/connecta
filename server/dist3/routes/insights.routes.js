"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const insights_controller_1 = require("../controllers/insights.controller");
const router = express_1.default.Router();
router.get("/profile", insights_controller_1.getProfileAnalytics);
router.get("/gigs", insights_controller_1.getGigPerformance);
router.post("/skills/compare", insights_controller_1.compareSkillsToMarket);
router.get("/reports/weekly", insights_controller_1.generateWeeklyReport);
exports.default = router;
