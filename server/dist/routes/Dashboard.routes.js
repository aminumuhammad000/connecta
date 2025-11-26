"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Dashboard_controller_1 = require("../controllers/Dashboard.controller");
const auth_middleware_1 = require("../core/middleware/auth.middleware");
const router = (0, express_1.Router)();
// All dashboard routes require authentication
router.use(auth_middleware_1.authenticate);
// Get client dashboard stats
router.get('/stats', Dashboard_controller_1.getClientDashboard);
// Get top freelancers recommendations
router.get('/freelancers', Dashboard_controller_1.getTopFreelancers);
// Get recent messages for dashboard
router.get('/messages', Dashboard_controller_1.getRecentMessages);
exports.default = router;
