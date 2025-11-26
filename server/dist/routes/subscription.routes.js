"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const subscription_controller_1 = require("../controllers/subscription.controller");
const auth_middleware_1 = require("../core/middleware/auth.middleware");
const router = express_1.default.Router();
// Admin: Get all subscriptions (no auth)
router.get('/admin/all', subscription_controller_1.getAllSubscriptions);
// Admin: Get subscription stats (no auth)
router.get('/admin/stats', subscription_controller_1.getSubscriptionStats);
// Create subscription (protected)
router.post('/', auth_middleware_1.authenticate, subscription_controller_1.createSubscription);
// Get user subscription (protected)
router.get('/my-subscription', auth_middleware_1.authenticate, subscription_controller_1.getUserSubscription);
// Cancel subscription (protected)
router.patch('/:subscriptionId/cancel', auth_middleware_1.authenticate, subscription_controller_1.cancelSubscription);
exports.default = router;
