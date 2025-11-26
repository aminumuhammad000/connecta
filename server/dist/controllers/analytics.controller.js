"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalyticsStats = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const Project_model_1 = __importDefault(require("../models/Project.model"));
const Proposal_model_1 = __importDefault(require("../models/Proposal.model"));
const Payment_model_1 = __importDefault(require("../models/Payment.model"));
const Contract_model_1 = __importDefault(require("../models/Contract.model"));
const Review_model_1 = __importDefault(require("../models/Review.model"));
const Job_model_1 = __importDefault(require("../models/Job.model"));
const Subscription_model_1 = __importDefault(require("../models/Subscription.model"));
const getAnalyticsStats = async (req, res) => {
    try {
        // Get total counts
        const totalUsers = await user_model_1.default.countDocuments();
        const totalProjects = await Project_model_1.default.countDocuments();
        const totalJobs = await Job_model_1.default.countDocuments();
        const totalProposals = await Proposal_model_1.default.countDocuments();
        const totalPayments = await Payment_model_1.default.countDocuments();
        const totalContracts = await Contract_model_1.default.countDocuments();
        const totalReviews = await Review_model_1.default.countDocuments();
        // Get user type counts
        const clientsCount = await user_model_1.default.countDocuments({ userType: 'client' });
        const freelancersCount = await user_model_1.default.countDocuments({ userType: 'freelancer' });
        // Get project status counts
        const activeProjects = await Project_model_1.default.countDocuments({ status: 'active' });
        const completedProjects = await Project_model_1.default.countDocuments({ status: 'completed' });
        // Get total revenue from payments
        const paymentRevenue = await Payment_model_1.default.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalPaymentRevenue = paymentRevenue[0]?.total || 0;
        // Get user growth (monthly)
        const userGrowth = await user_model_1.default.aggregate([
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
        const acceptedProposals = await Proposal_model_1.default.countDocuments({ status: 'accepted' });
        const rejectedProposals = await Proposal_model_1.default.countDocuments({ status: 'rejected' });
        const proposalSuccessRate = totalProposals > 0
            ? Math.round((acceptedProposals / totalProposals) * 100)
            : 0;
        // Get weekly revenue from payments (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const weeklyPaymentRevenue = await Payment_model_1.default.aggregate([
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
        const subscriptionRevenue = await Subscription_model_1.default.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalSubscriptionRevenue = subscriptionRevenue[0]?.total || 0;
        // Get weekly subscription revenue (last 7 days)
        const weeklySubscriptionRevenue = await Subscription_model_1.default.aggregate([
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
        const activeSubscriptions = await Subscription_model_1.default.countDocuments({
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
    }
    catch (error) {
        console.error('Get analytics stats error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch analytics stats'
        });
    }
};
exports.getAnalyticsStats = getAnalyticsStats;
