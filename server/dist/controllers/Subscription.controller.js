"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminDeleteSubscription = exports.adminReactivateSubscription = exports.adminCancelSubscription = exports.getSubscriptionStats = exports.getAllSubscriptions = exports.cancelSubscription = exports.verifyUpgradePayment = exports.initializeUpgradePayment = exports.getMySubscription = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const subscription_model_1 = __importDefault(require("../models/subscription.model"));
/**
 * @desc Get current user's subscription
 * @route GET /api/subscriptions/me
 */
const getMySubscription = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const user = await user_model_1.default.findById(userId).select('isPremium subscriptionTier subscriptionStatus premiumExpiryDate');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if subscription is expired
        const now = new Date();
        const isExpired = user.premiumExpiryDate && user.premiumExpiryDate < now;
        if (isExpired && user.isPremium) {
            // Auto-expire subscription
            user.isPremium = false;
            user.subscriptionStatus = 'expired';
            user.subscriptionTier = 'free';
            await user.save();
        }
        const daysUntilExpiry = user.premiumExpiryDate
            ? Math.ceil((user.premiumExpiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            : null;
        res.status(200).json({
            success: true,
            data: {
                isPremium: user.isPremium,
                subscriptionTier: user.subscriptionTier || 'free',
                subscriptionStatus: user.subscriptionStatus || 'active',
                expiryDate: user.premiumExpiryDate,
                daysUntilExpiry,
                isExpiringSoon: daysUntilExpiry !== null && daysUntilExpiry <= 7,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getMySubscription = getMySubscription;
/**
 * @desc Upgrade user subscription
 * @route POST /api/subscriptions/upgrade
 */
const flutterwave_service_1 = __importDefault(require("../services/flutterwave.service"));
/**
 * @desc Initialize subscription upgrade payment
 * @route POST /api/subscriptions/initialize-upgrade
 */
const initializeUpgradePayment = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const { tier, durationMonths = 1 } = req.body;
        if (!['premium', 'enterprise'].includes(tier)) {
            return res.status(400).json({ message: 'Invalid subscription tier' });
        }
        // Define pricing (could be moved to a config or DB)
        const prices = {
            premium: 5000,
            enterprise: 20000
        };
        const amount = prices[tier] * durationMonths;
        // Fetch user to ensure we have email
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log('User data:', { id: user._id, email: user.email, firstName: user.firstName });
        if (!user.email || !user.email.includes('@')) {
            console.error('Invalid email detected:', user.email);
            return res.status(400).json({ message: 'Invalid user email. Please update your profile with a valid email address.' });
        }
        console.log('Initializing subscription payment for user:', user.email);
        // Generate unique reference
        const reference = `SUB_${userId}_${Date.now()}`;
        const paymentResponse = await flutterwave_service_1.default.initializePayment(user.email, amount, reference, {
            userId,
            type: 'subscription',
            tier,
            durationMonths
        });
        res.status(200).json({
            success: true,
            data: {
                reference,
                authorizationUrl: paymentResponse.data.link
            }
        });
    }
    catch (error) {
        console.error('Subscription payment init error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.initializeUpgradePayment = initializeUpgradePayment;
/**
 * @desc Verify subscription upgrade payment
 * @route POST /api/subscriptions/verify-upgrade
 */
const verifyUpgradePayment = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const { transaction_id, tx_ref } = req.body;
        console.log('Verifying subscription payment:', { transaction_id, tx_ref });
        if (!transaction_id && !tx_ref) {
            return res.status(400).json({ message: 'Missing transaction reference' });
        }
        // Verify with Flutterwave
        const verification = await flutterwave_service_1.default.verifyPayment(String(transaction_id || tx_ref));
        console.log('Flutterwave verification response:', JSON.stringify(verification, null, 2));
        if (verification.data?.status === 'successful') {
            const user = await user_model_1.default.findById(userId);
            if (!user)
                return res.status(404).json({ message: 'User not found' });
            // Extract metadata to confirm details (optional but recommended)
            const meta = verification.data?.meta || {};
            const tier = meta.tier || 'premium'; // Default fallback
            const durationMonths = parseInt(meta.durationMonths || '1');
            // Calculate expiry date
            const now = new Date();
            const expiryDate = new Date(now);
            expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
            // Update user subscription
            user.isPremium = true;
            user.subscriptionTier = tier;
            user.subscriptionStatus = 'active';
            user.premiumExpiryDate = expiryDate;
            await user.save();
            // Create Subscription record
            await subscription_model_1.default.create({
                userId: user._id,
                plan: tier,
                amount: verification.data?.amount || 0,
                currency: verification.data?.currency || 'NGN',
                status: 'active',
                startDate: now,
                endDate: expiryDate,
                paymentReference: String(transaction_id || tx_ref),
                autoRenew: false // Default to false for now
            });
            return res.status(200).json({
                success: true,
                message: 'Subscription upgraded successfully',
                data: {
                    isPremium: user.isPremium,
                    subscriptionTier: user.subscriptionTier,
                    subscriptionStatus: user.subscriptionStatus,
                    expiryDate: user.premiumExpiryDate,
                },
            });
        }
        else {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            });
        }
    }
    catch (error) {
        console.error('Subscription verification error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.verifyUpgradePayment = verifyUpgradePayment;
/**
 * @desc Cancel user subscription
 * @route POST /api/subscriptions/cancel
 */
const cancelSubscription = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Mark as cancelled but keep active until expiry
        user.subscriptionStatus = 'cancelled';
        await user.save();
        // Update Subscription record
        await subscription_model_1.default.findOneAndUpdate({ userId: user._id, status: 'active' }, { status: 'cancelled' });
        res.status(200).json({
            success: true,
            message: 'Subscription cancelled. You will retain access until expiry date.',
            data: {
                subscriptionStatus: user.subscriptionStatus,
                expiryDate: user.premiumExpiryDate,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.cancelSubscription = cancelSubscription;
/**
 * @desc Get all subscriptions (Admin)
 * @route GET /api/subscriptions/admin/all
 */
const getAllSubscriptions = async (req, res) => {
    try {
        const subscriptions = await subscription_model_1.default.find()
            .populate('userId', 'firstName lastName email userType isPremium')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            subscriptions
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAllSubscriptions = getAllSubscriptions;
/**
 * @desc Get subscription stats (Admin)
 * @route GET /api/subscriptions/admin/stats
 */
const getSubscriptionStats = async (req, res) => {
    try {
        const activeSubscriptions = await subscription_model_1.default.countDocuments({ status: 'active' });
        const totalSubscriptions = await subscription_model_1.default.countDocuments();
        const expiredSubscriptions = await subscription_model_1.default.countDocuments({ status: 'expired' });
        const cancelledSubscriptions = await subscription_model_1.default.countDocuments({ status: 'cancelled' });
        // Calculate monthly revenue (active subscriptions in current month)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyRevenueData = await subscription_model_1.default.aggregate([
            {
                $match: {
                    status: 'active',
                    createdAt: { $gte: startOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);
        const totalRevenueData = await subscription_model_1.default.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);
        res.status(200).json({
            success: true,
            data: {
                activeSubscriptions,
                totalSubscriptions,
                expiredSubscriptions,
                cancelledSubscriptions,
                monthlyRevenue: monthlyRevenueData[0]?.total || 0,
                totalRevenue: totalRevenueData[0]?.total || 0
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getSubscriptionStats = getSubscriptionStats;
/**
 * @desc Admin cancel subscription
 * @route PATCH /api/subscriptions/:id/cancel
 */
const adminCancelSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const subscription = await subscription_model_1.default.findById(id);
        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }
        subscription.status = 'cancelled';
        await subscription.save();
        // Also update user status
        await user_model_1.default.findByIdAndUpdate(subscription.userId, {
            subscriptionStatus: 'cancelled'
        });
        res.status(200).json({
            success: true,
            message: 'Subscription cancelled successfully'
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.adminCancelSubscription = adminCancelSubscription;
/**
 * @desc Admin reactivate subscription
 * @route PATCH /api/subscriptions/:id/reactivate
 */
const adminReactivateSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const subscription = await subscription_model_1.default.findById(id);
        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }
        subscription.status = 'active';
        await subscription.save();
        // Also update user status
        await user_model_1.default.findByIdAndUpdate(subscription.userId, {
            subscriptionStatus: 'active',
            isPremium: true
        });
        res.status(200).json({
            success: true,
            message: 'Subscription reactivated successfully'
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.adminReactivateSubscription = adminReactivateSubscription;
/**
 * @desc Admin delete subscription
 * @route DELETE /api/subscriptions/:id
 */
const adminDeleteSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const subscription = await subscription_model_1.default.findById(id);
        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }
        // If it was the active subscription, we might want to update the user
        if (subscription.status === 'active') {
            await user_model_1.default.findByIdAndUpdate(subscription.userId, {
                isPremium: false,
                subscriptionTier: 'free',
                subscriptionStatus: 'expired'
            });
        }
        await subscription_model_1.default.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: 'Subscription record deleted successfully'
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.adminDeleteSubscription = adminDeleteSubscription;
