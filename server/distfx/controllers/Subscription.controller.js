import Subscription from '../models/Subscription.model.js';
import User from '../models/user.model.js';
// Get all subscriptions (admin)
export const getAllSubscriptions = async (req, res) => {
    try {
        const { status, limit = 50, page = 1 } = req.query;
        let query = {};
        if (status && (status === 'active' || status === 'expired' || status === 'cancelled')) {
            query.status = status;
        }
        const skip = (Number(page) - 1) * Number(limit);
        const subscriptions = await Subscription.find(query)
            .populate('userId', 'firstName lastName email userType isPremium')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(skip);
        const total = await Subscription.countDocuments(query);
        res.status(200).json({
            success: true,
            count: subscriptions.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            subscriptions,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching subscriptions',
            error: error.message,
        });
    }
};
// Get subscription statistics (admin)
export const getSubscriptionStats = async (req, res) => {
    try {
        const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
        const totalSubscriptions = await Subscription.countDocuments();
        const expiredSubscriptions = await Subscription.countDocuments({ status: 'expired' });
        const cancelledSubscriptions = await Subscription.countDocuments({ status: 'cancelled' });
        // Calculate monthly revenue (subscriptions started in current month)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const monthlySubscriptions = await Subscription.find({
            startDate: { $gte: startOfMonth, $lte: endOfMonth },
        });
        const monthlyRevenue = monthlySubscriptions.reduce((sum, sub) => sum + sub.amount, 0);
        // Calculate total revenue
        const allSubscriptions = await Subscription.find({});
        const totalRevenue = allSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);
        // Calculate average price per subscription
        const pricePerSubscription = totalSubscriptions > 0 ? totalRevenue / totalSubscriptions : 0;
        res.status(200).json({
            success: true,
            data: {
                activeSubscriptions,
                totalSubscriptions,
                expiredSubscriptions,
                cancelledSubscriptions,
                monthlyRevenue,
                totalRevenue,
                pricePerSubscription,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching subscription statistics',
            error: error.message,
        });
    }
};
// Cancel subscription
export const cancelSubscription = async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        const subscription = await Subscription.findByIdAndUpdate(subscriptionId, { status: 'cancelled' }, { new: true, runValidators: true });
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found',
            });
        }
        // Update user's premium status
        await User.findByIdAndUpdate(subscription.userId, {
            isPremium: false,
            subscriptionStatus: 'cancelled',
        });
        res.status(200).json({
            success: true,
            message: 'Subscription cancelled successfully',
            data: subscription,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error cancelling subscription',
            error: error.message,
        });
    }
};
// Reactivate subscription
export const reactivateSubscription = async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found',
            });
        }
        // Check if subscription is expired
        if (subscription.endDate < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot reactivate expired subscription. Please create a new subscription.',
            });
        }
        subscription.status = 'active';
        await subscription.save();
        // Update user's premium status
        await User.findByIdAndUpdate(subscription.userId, {
            isPremium: true,
            subscriptionStatus: 'active',
            premiumExpiryDate: subscription.endDate,
        });
        res.status(200).json({
            success: true,
            message: 'Subscription reactivated successfully',
            data: subscription,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error reactivating subscription',
            error: error.message,
        });
    }
};
// Delete subscription
export const deleteSubscription = async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        const subscription = await Subscription.findByIdAndDelete(subscriptionId);
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found',
            });
        }
        res.status(200).json({
            success: true,
            message: 'Subscription deleted successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting subscription',
            error: error.message,
        });
    }
};
