import { Request, Response } from 'express';
import Subscription from '../models/Subscription.model';
import User from '../models/user.model';

const PREMIUM_PRICE = 5000; // ₦5,000

/**
 * Create premium subscription
 */
export const createSubscription = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;
    const { paymentReference } = req.body;

    // Check if user already has active subscription
    const existingSubscription = await Subscription.findOne({
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
    const subscription = await Subscription.create({
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
    await User.findByIdAndUpdate(userId, {
      isPremium: true,
      premiumExpiryDate: endDate,
    });

    return res.status(201).json({
      success: true,
      message: 'Premium subscription activated successfully',
      data: subscription,
    });
  } catch (error: any) {
    console.error('Create subscription error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create subscription',
    });
  }
};

/**
 * Get all subscriptions for admin
 */
export const getAllSubscriptions = async (req: Request, res: Response) => {
  try {
    const subscriptions = await Subscription.find()
      .populate('userId', 'firstName lastName email userType profileImage')
      .sort({ createdAt: -1 })
      .limit(100);

    const stats = await Subscription.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      }
    ]);

    const totalRevenue = await Subscription.aggregate([
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
  } catch (error: any) {
    console.error('Get all subscriptions error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch subscriptions',
    });
  }
};

/**
 * Get user subscription
 */
export const getUserSubscription = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || (req as any).user?.userId;

    const subscription = await Subscription.findOne({
      userId,
      status: 'active',
      endDate: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: subscription,
      isPremium: !!subscription,
    });
  } catch (error: any) {
    console.error('Get user subscription error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch subscription',
    });
  }
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await Subscription.findByIdAndUpdate(
      subscriptionId,
      { status: 'cancelled' },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found',
      });
    }

    // Update user premium status
    await User.findByIdAndUpdate(subscription.userId, {
      isPremium: false,
      premiumExpiryDate: null,
    });

    return res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: subscription,
    });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel subscription',
    });
  }
};

/**
 * Get subscription stats for analytics
 */
export const getSubscriptionStats = async (req: Request, res: Response) => {
  try {
    const activeSubscriptions = await Subscription.countDocuments({
      status: 'active',
      endDate: { $gt: new Date() }
    });

    const monthlyRevenue = await Subscription.aggregate([
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

    const weeklyRevenue = await Subscription.aggregate([
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
  } catch (error: any) {
    console.error('Get subscription stats error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch subscription stats',
    });
  }
};
