"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubscription = exports.reactivateSubscription = exports.cancelSubscription = exports.getSubscriptionStats = exports.getAllSubscriptions = void 0;
const subscription_model_1 = __importDefault(require("../models/subscription.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
// Get all subscriptions (Admin)
const getAllSubscriptions = async (req, res) => {
    try {
        const { status, limit = 100 } = req.query;
        const query = {};
        if (status) {
            query.status = status;
        }
        const subscriptions = await subscription_model_1.default.find(query)
            .populate('userId', 'firstName lastName email userType isPremium')
            .sort({ createdAt: -1 })
            .limit(Number(limit));
        res.status(200).json({
            success: true,
            subscriptions,
            total: subscriptions.length,
        });
    }
    catch (error) {
        console.error('Get subscriptions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subscriptions',
            error: error.message,
        });
    }
};
exports.getAllSubscriptions = getAllSubscriptions;
// Get subscription stats (Admin)
const getSubscriptionStats = async (req, res) => {
    try {
        const activeSubscriptions = await subscription_model_1.default.countDocuments({ status: 'active' });
        const totalSubscriptions = await subscription_model_1.default.countDocuments();
        const expiredSubscriptions = await subscription_model_1.default.countDocuments({ status: 'expired' });
        const cancelledSubscriptions = await subscription_model_1.default.countDocuments({ status: 'cancelled' });
        // Calculate monthly revenue (active subscriptions this month)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const monthlyRevenue = await subscription_model_1.default.aggregate([
            {
                $match: {
                    status: 'active',
                    createdAt: { $gte: startOfMonth },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' },
                },
            },
        ]);
        // Calculate total revenue from all subscriptions
        const totalRevenueResult = await subscription_model_1.default.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' },
                },
            },
        ]);
        res.status(200).json({
            success: true,
            data: {
                activeSubscriptions,
                totalSubscriptions,
                expiredSubscriptions,
                cancelledSubscriptions,
                monthlyRevenue: monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0,
                totalRevenue: totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0,
                pricePerSubscription: 5000,
            },
        });
    }
    catch (error) {
        console.error('Get subscription stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subscription stats',
            error: error.message,
        });
    }
};
exports.getSubscriptionStats = getSubscriptionStats;
// Cancel subscription (Admin)
const cancelSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const subscription = await subscription_model_1.default.findById(id);
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found',
            });
        }
        if (subscription.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Subscription is already cancelled',
            });
        }
        subscription.status = 'cancelled';
        subscription.autoRenew = false;
        await subscription.save();
        // Update user's premium status
        if (subscription.userId) {
            await user_model_1.default.findByIdAndUpdate(subscription.userId, {
                isPremium: false,
                premiumExpiryDate: null,
            });
        }
        res.status(200).json({
            success: true,
            message: 'Subscription cancelled successfully',
            subscription,
        });
    }
    catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel subscription',
            error: error.message,
        });
    }
};
exports.cancelSubscription = cancelSubscription;
// Reactivate subscription (Admin)
const reactivateSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const subscription = await subscription_model_1.default.findById(id);
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found',
            });
        }
        // Update subscription status to active and extend end date
        subscription.status = 'active';
        const newEndDate = new Date();
        newEndDate.setDate(newEndDate.getDate() + 30);
        subscription.endDate = newEndDate;
        await subscription.save();
        // Update user's premium status
        if (subscription.userId) {
            await user_model_1.default.findByIdAndUpdate(subscription.userId, {
                isPremium: true,
                premiumExpiryDate: newEndDate,
            });
        }
        res.status(200).json({
            success: true,
            message: 'Subscription reactivated successfully',
            subscription,
        });
    }
    catch (error) {
        console.error('Reactivate subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reactivate subscription',
            error: error.message,
        });
    }
};
exports.reactivateSubscription = reactivateSubscription;
// Delete subscription (Admin)
const deleteSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const subscription = await subscription_model_1.default.findByIdAndDelete(id);
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found',
            });
        }
        // Update user's premium status if subscription was active
        if (subscription.userId && subscription.status === 'active') {
            await user_model_1.default.findByIdAndUpdate(subscription.userId, {
                isPremium: false,
                premiumExpiryDate: null,
            });
        }
        res.status(200).json({
            success: true,
            message: 'Subscription deleted successfully',
        });
    }
    catch (error) {
        console.error('Delete subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete subscription',
            error: error.message,
        });
    }
};
exports.deleteSubscription = deleteSubscription;
