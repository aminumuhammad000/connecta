import { Request, Response } from 'express';
import Subscription from '../models/subscription.model';
import User from '../models/user.model';

// Get all subscriptions (Admin)
export const getAllSubscriptions = async (req: Request, res: Response) => {
  try {
    const { status, limit = 100 } = req.query;
    
    const query: any = {};
    if (status) {
      query.status = status;
    }

    const subscriptions = await Subscription.find(query)
      .populate('userId', 'firstName lastName email userType isPremium')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      subscriptions,
      total: subscriptions.length,
    });
  } catch (error: any) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions',
      error: error.message,
    });
  }
};

// Get subscription stats (Admin)
export const getSubscriptionStats = async (req: Request, res: Response) => {
  try {
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const totalSubscriptions = await Subscription.countDocuments();
    const expiredSubscriptions = await Subscription.countDocuments({ status: 'expired' });
    const cancelledSubscriptions = await Subscription.countDocuments({ status: 'cancelled' });

    // Calculate monthly revenue (active subscriptions this month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyRevenue = await Subscription.aggregate([
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
    const totalRevenueResult = await Subscription.aggregate([
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
  } catch (error: any) {
    console.error('Get subscription stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription stats',
      error: error.message,
    });
  }
};

// Cancel subscription (Admin)
export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findById(id);
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
      await User.findByIdAndUpdate(subscription.userId, {
        isPremium: false,
        premiumExpiryDate: null,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription,
    });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
      error: error.message,
    });
  }
};

// Reactivate subscription (Admin)
export const reactivateSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findById(id);
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
      await User.findByIdAndUpdate(subscription.userId, {
        isPremium: true,
        premiumExpiryDate: newEndDate,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subscription reactivated successfully',
      subscription,
    });
  } catch (error: any) {
    console.error('Reactivate subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate subscription',
      error: error.message,
    });
  }
};

// Delete subscription (Admin)
export const deleteSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findByIdAndDelete(id);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found',
      });
    }

    // Update user's premium status if subscription was active
    if (subscription.userId && subscription.status === 'active') {
      await User.findByIdAndUpdate(subscription.userId, {
        isPremium: false,
        premiumExpiryDate: null,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subscription deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subscription',
      error: error.message,
    });
  }
};
