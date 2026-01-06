"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelSubscription = exports.verifyUpgradePayment = exports.initializeUpgradePayment = exports.getMySubscription = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
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
