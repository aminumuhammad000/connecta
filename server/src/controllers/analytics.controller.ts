import { Request, Response } from 'express';
import User from '../models/user.model';
import Project from '../models/Project.model';
import Proposal from '../models/Proposal.model';
import Payment from '../models/Payment.model';
import Contract from '../models/Contract.model';
import Review from '../models/Review.model';
import Job from '../models/Job.model';
import Subscription from '../models/Subscription.model';

export const getAnalyticsStats = async (req: Request, res: Response) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalProposals = await Proposal.countDocuments();
    const totalPayments = await Payment.countDocuments();
    const totalContracts = await Contract.countDocuments();
    const totalReviews = await Review.countDocuments();

    // Get user type counts
    const clientsCount = await User.countDocuments({ userType: 'client' });
    const freelancersCount = await User.countDocuments({ userType: 'freelancer' });

    // Get project status counts
    const activeProjects = await Project.countDocuments({ status: 'active' });
    const completedProjects = await Project.countDocuments({ status: 'completed' });

    // Get total revenue from payments
    const paymentRevenue = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalPaymentRevenue = paymentRevenue[0]?.total || 0;

    // Get user growth (monthly)
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    // Format user growth data
    const formattedUserGrowth = userGrowth.map(item => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      users: item.count
    }));

    // Get proposal statistics
    const acceptedProposals = await Proposal.countDocuments({ status: 'accepted' });
    const rejectedProposals = await Proposal.countDocuments({ status: 'rejected' });
    const proposalSuccessRate = totalProposals > 0 
      ? Math.round((acceptedProposals / totalProposals) * 100) 
      : 0;

    // Get weekly revenue from payments (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyPaymentRevenue = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format weekly revenue data
    const formattedWeeklyPaymentRevenue = weeklyPaymentRevenue.map(item => ({
      date: item._id,
      amount: item.amount
    }));

    // Get subscription revenue
    const subscriptionRevenue = await Subscription.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalSubscriptionRevenue = subscriptionRevenue[0]?.total || 0;

    // Get weekly subscription revenue (last 7 days)
    const weeklySubscriptionRevenue = await Subscription.aggregate([
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

    // Format weekly subscription revenue
    const formattedWeeklySubscriptionRevenue = weeklySubscriptionRevenue.map(item => ({
      date: item._id,
      amount: item.amount,
      subscriptions: item.count
    }));

    // Get active subscriptions count
    const activeSubscriptions = await Subscription.countDocuments({
      status: 'active',
      endDate: { $gt: new Date() }
    });

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalProjects,
          totalJobs,
          totalProposals,
          totalPayments,
          totalContracts,
          totalReviews,
          clientsCount,
          freelancersCount,
          activeProjects,
          completedProjects,
          paymentRevenue: totalPaymentRevenue,
          subscriptionRevenue: totalSubscriptionRevenue,
          totalRevenue: totalPaymentRevenue + totalSubscriptionRevenue,
          activeSubscriptions
        },
        userGrowth: formattedUserGrowth,
        proposalStats: {
          total: totalProposals,
          accepted: acceptedProposals,
          rejected: rejectedProposals,
          pending: totalProposals - acceptedProposals - rejectedProposals,
          successRate: proposalSuccessRate
        },
        weeklyPaymentRevenue: formattedWeeklyPaymentRevenue,
        weeklySubscriptionRevenue: formattedWeeklySubscriptionRevenue
      }
    });
  } catch (error: any) {
    console.error('Get analytics stats error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch analytics stats'
    });
  }
};
