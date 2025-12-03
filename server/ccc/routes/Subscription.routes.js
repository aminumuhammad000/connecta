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
// Initialize upgrade payment
router.post('/initialize-upgrade', Subscription_controller_1.initializeUpgradePayment);
// Verify upgrade payment
router.post('/verify-upgrade', Subscription_controller_1.verifyUpgradePayment);
// Cancel subscription
router.post('/cancel', Subscription_controller_1.cancelSubscription);
exports.default = router;
