import User from '../models/user.model.js';
import Job from '../models/Job.model.js';
import Project from '../models/Project.model.js';
import Proposal from '../models/Proposal.model.js';
import Payment from '../models/Payment.model.js';
import Subscription from '../models/Subscription.model.js';
import Contract from '../models/Contract.model.js';
import Review from '../models/Review.model.js';
export const getAnalyticsStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        // User growth
        const totalUsers = await User.countDocuments();
        const usersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });
        const usersLastMonth = await User.countDocuments({
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        });
        const totalClients = await User.countDocuments({ userType: 'client' });
        const totalFreelancers = await User.countDocuments({ userType: 'freelancer' });
        // Job stats
        const totalJobs = await Job.countDocuments();
        const jobsThisMonth = await Job.countDocuments({ createdAt: { $gte: startOfMonth } });
        const jobsLastMonth = await Job.countDocuments({
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        });
        const openJobs = await Job.countDocuments({ status: { $in: ['Open', 'open', 'active'] } });
        const inProgressJobs = await Job.countDocuments({ status: 'in_progress' });
        const closedJobs = await Job.countDocuments({ status: 'closed' });
        // Project stats
        const totalProjects = await Project.countDocuments();
        const projectsThisMonth = await Project.countDocuments({ createdAt: { $gte: startOfMonth } });
        const projectsLastMonth = await Project.countDocuments({
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        });
        const activeProjects = await Project.countDocuments({
            status: { $in: ['ongoing', 'active', 'In-Progress', 'submitted', 'revision_requested'] }
        });
        const completedProjects = await Project.countDocuments({ status: 'completed' });
        // Proposal stats
        const totalProposals = await Proposal.countDocuments();
        const proposalsThisMonth = await Proposal.countDocuments({ createdAt: { $gte: startOfMonth } });
        const acceptedProposals = await Proposal.countDocuments({ status: 'accepted' });
        const rejectedProposals = await Proposal.countDocuments({ status: 'rejected' });
        const pendingProposals = await Proposal.countDocuments({ status: 'pending' });
        // Financial stats
        const revenueResult = await Payment.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;
        const revenueThisMonth = await Payment.aggregate([
            {
                $match: {
                    status: 'completed',
                    createdAt: { $gte: startOfMonth }
                }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const monthlyRevenue = revenueThisMonth[0]?.total || 0;
        const revenueLastMonth = await Payment.aggregate([
            {
                $match: {
                    status: 'completed',
                    createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
                }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const lastMonthRevenue = revenueLastMonth[0]?.total || 0;
        // Subscription stats
        const totalSubscriptions = await Subscription.countDocuments();
        const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
        const subscriptionRevenueResult = await Subscription.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const subscriptionRevenue = subscriptionRevenueResult[0]?.total || 0;
        // Contract stats
        const totalContracts = await Contract.countDocuments();
        const activeContracts = await Contract.countDocuments({ status: 'active' });
        // Review stats
        const totalReviews = await Review.countDocuments();
        const avgRatingResult = await Review.aggregate([
            { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]);
        const avgRating = avgRatingResult[0]?.avgRating || 0;
        // Calculate trends
        const userGrowth = usersLastMonth > 0 ? ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100 : 0;
        const jobGrowth = jobsLastMonth > 0 ? ((jobsThisMonth - jobsLastMonth) / jobsLastMonth) * 100 : 0;
        const projectGrowth = projectsLastMonth > 0 ? ((projectsThisMonth - projectsLastMonth) / projectsLastMonth) * 100 : 0;
        const revenueGrowth = lastMonthRevenue > 0 ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
        const proposalSuccessRate = totalProposals > 0 ? (acceptedProposals / totalProposals) * 100 : 0;
        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalClients,
                    totalFreelancers,
                    totalProjects,
                    totalJobs,
                    totalRevenue,
                    subscriptionRevenue,
                    activeSubscriptions,
                    userGrowth: Math.round(userGrowth * 10) / 10,
                    jobGrowth: Math.round(jobGrowth * 10) / 10,
                    projectGrowth: Math.round(projectGrowth * 10) / 10,
                    revenueGrowth: Math.round(revenueGrowth * 10) / 10,
                },
                jobs: {
                    total: totalJobs,
                    open: openJobs,
                    inProgress: inProgressJobs,
                    closed: closedJobs,
                    thisMonth: jobsThisMonth,
                },
                projects: {
                    total: totalProjects,
                    active: activeProjects,
                    completed: completedProjects,
                    thisMonth: projectsThisMonth,
                },
                proposals: {
                    total: totalProposals,
                    accepted: acceptedProposals,
                    rejected: rejectedProposals,
                    pending: pendingProposals,
                    successRate: Math.round(proposalSuccessRate * 10) / 10,
                },
                contracts: {
                    total: totalContracts,
                    active: activeContracts,
                },
                reviews: {
                    total: totalReviews,
                    avgRating: Math.round(avgRating * 10) / 10,
                },
                financials: {
                    totalRevenue,
                    monthlyRevenue,
                    lastMonthRevenue,
                    subscriptionRevenue,
                },
            },
        });
    }
    catch (error) {
        console.error('Error fetching analytics stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics stats',
            error: error.message,
        });
    }
};
