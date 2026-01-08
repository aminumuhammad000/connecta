"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const analytics_controller_1 = require("../controllers/analytics.controller");
const router = express_1.default.Router();
// Admin: Get analytics stats (no auth for admin panel)
router.get('/stats', analytics_controller_1.getAnalyticsStats);
exports.default = router;
