"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const subscription_controller_1 = require("../controllers/subscription.controller");
const router = express_1.default.Router();
// Admin routes
router.get('/admin/all', subscription_controller_1.getAllSubscriptions);
router.get('/admin/stats', subscription_controller_1.getSubscriptionStats);
router.patch('/:id/cancel', subscription_controller_1.cancelSubscription);
router.patch('/:id/reactivate', subscription_controller_1.reactivateSubscription);
router.delete('/:id', subscription_controller_1.deleteSubscription);
exports.default = router;
