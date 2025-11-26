"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscriptionStats = exports.cancelSubscription = exports.getUserSubscription = exports.getAllSubscriptions = exports.createSubscription = void 0;
const Subscription_model_1 = __importDefault(require("../models/Subscription.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const PREMIUM_PRICE = 5000; // ₦5,000
/**
 * Create premium subscription
 */
const createSubscription = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.user?.userId;
        const { paymentReference } = req.body;
        // Check if user already has active subscription
        const existingSubscription = await Subscription_model_1.default.findOne({
            userId,
            status: 'active',
            endDate: { $gt: new Date() }
        });
        if (existingSubscription) {
            return res.status(400).json({
                success: false,
                message: 'User already has an active premium subscription'
            });
        }
        // Calculate subscription period (30 days)
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        // Create subscription
        const subscription = await Subscription_model_1.default.create({
            userId,
            plan: 'premium',
            amount: PREMIUM_PRICE,
            currency: 'NGN',
            status: 'active',
            startDate,
            endDate,
            paymentReference: paymentReference || `SUB-${Date.now()}`,
            autoRenew: false,
        });
        // Update user to premium
        await user_model_1.default.findByIdAndUpdate(userId, {
            isPremium: true,
            premiumExpiryDate: endDate,
        });
        return res.status(201).json({
            success: true,
            message: 'Premium subscription activated successfully',
            data: subscription,
        });
    }
    catch (error) {
        console.error('Create subscription error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to create subscription',
        });
    }
};
exports.createSubscription = createSubscription;
/**
 * Get all subscriptions for admin
 */
const getAllSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription_model_1.default.find()
            .populate('userId', 'firstName lastName email userType profileImage')
            .sort({ createdAt: -1 })
            .limit(100);
        const stats = await Subscription_model_1.default.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    revenue: { $sum: '$amount' }
                }
            }
        ]);
        const totalRevenue = await Subscription_model_1.default.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        return res.status(200).json({
            success: true,
            data: subscriptions,
            stats: {
                byStatus: stats,
                totalRevenue: totalRevenue[0]?.total || 0,
                totalSubscriptions: subscriptions.length
            }
        });
    }
    catch (error) {
        console.error('Get all subscriptions error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch subscriptions',
        });
    }
};
exports.getAllSubscriptions = getAllSubscriptions;
/**
 * Get user subscription
 */
const getUserSubscription = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.user?.userId;
        const subscription = await Subscription_model_1.default.findOne({
            userId,
            status: 'active',
            endDate: { $gt: new Date() }
        }).sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            data: subscription,
            isPremium: !!subscription,
        });
    }
    catch (error) {
        console.error('Get user subscription error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch subscription',
        });
    }
};
exports.getUserSubscription = getUserSubscription;
/**
 * Cancel subscription
 */
const cancelSubscription = async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        const subscription = await Subscription_model_1.default.findByIdAndUpdate(subscriptionId, { status: 'cancelled' }, { new: true });
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found',
            });
        }
        // Update user premium status
        await user_model_1.default.findByIdAndUpdate(subscription.userId, {
            isPremium: false,
            premiumExpiryDate: null,
        });
        return res.status(200).json({
            success: true,
            message: 'Subscription cancelled successfully',
            data: subscription,
        });
    }
    catch (error) {
        console.error('Cancel subscription error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to cancel subscription',
        });
    }
};
exports.cancelSubscription = cancelSubscription;
/**
 * Get subscription stats for analytics
 */
const getSubscriptionStats = async (req, res) => {
    try {
        const activeSubscriptions = await Subscription_model_1.default.countDocuments({
            status: 'active',
            endDate: { $gt: new Date() }
        });
        const monthlyRevenue = await Subscription_model_1.default.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(new Date().setDate(new Date().getDate() - 30))
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);
        const weeklyRevenue = await Subscription_model_1.default.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    amount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        return res.status(200).json({
            success: true,
            data: {
                activeSubscriptions,
                monthlyRevenue: monthlyRevenue[0]?.total || 0,
                weeklyRevenue,
                pricePerSubscription: PREMIUM_PRICE
            }
        });
    }
    catch (error) {
        console.error('Get subscription stats error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch subscription stats',
        });
    }
};
exports.getSubscriptionStats = getSubscriptionStats;
