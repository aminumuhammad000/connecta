"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Subscription_controller_1 = require("../controllers/Subscription.controller");
const auth_middleware_1 = require("../core/middleware/auth.middleware");
const router = (0, express_1.Router)();
// All subscription routes require authentication
router.use(auth_middleware_1.authenticate);
// Get current user's subscription
router.get('/me', Subscription_controller_1.getMySubscription);
// Upgrade subscription
router.post('/upgrade', Subscription_controller_1.upgradeSubscription);
// Cancel subscription
router.post('/cancel', Subscription_controller_1.cancelSubscription);
exports.default = router;
