import { Request, Response } from 'express';
import User from '../models/user.model';

/**
 * @desc Get current user's subscription
 * @route GET /api/subscriptions/me
 */
export const getMySubscription = async (
    req: Request & { user?: { id?: string; _id?: string } },
    res: Response
) => {
    try {
        const userId = req.user?._id || req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const user = await User.findById(userId).select(
            'isPremium subscriptionTier subscriptionStatus premiumExpiryDate'
        );

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
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Upgrade user subscription
 * @route POST /api/subscriptions/upgrade
 */
export const upgradeSubscription = async (
    req: Request & { user?: { id?: string; _id?: string } },
    res: Response
) => {
    try {
        const userId = req.user?._id || req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const { tier, durationMonths = 1 } = req.body;

        if (!['premium', 'enterprise'].includes(tier)) {
            return res.status(400).json({ message: 'Invalid subscription tier' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

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

        res.status(200).json({
            success: true,
            message: 'Subscription upgraded successfully',
            data: {
                isPremium: user.isPremium,
                subscriptionTier: user.subscriptionTier,
                subscriptionStatus: user.subscriptionStatus,
                expiryDate: user.premiumExpiryDate,
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Cancel user subscription
 * @route POST /api/subscriptions/cancel
 */
export const cancelSubscription = async (
    req: Request & { user?: { id?: string; _id?: string } },
    res: Response
) => {
    try {
        const userId = req.user?._id || req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const user = await User.findById(userId);
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
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
