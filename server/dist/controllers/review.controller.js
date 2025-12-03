"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllReviews = exports.updateReview = exports.flagReview = exports.voteReview = exports.respondToReview = exports.getUserReviewStats = exports.getUserReviews = exports.createReview = void 0;
const Review_model_1 = __importDefault(require("../models/Review.model"));
const Project_model_1 = __importDefault(require("../models/Project.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
/**
 * Create a review for a completed project
 */
const createReview = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.user?.userId;
        const { projectId, rating, comment, tags } = req.body;
        // Validate input
        if (!projectId || !rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Project ID, rating, and comment are required',
            });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5',
            });
        }
        // Get project
        const project = await Project_model_1.default.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        // Check if project is completed
        if (project.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Can only review completed projects',
            });
        }
        // Determine reviewer type and reviewee
        let reviewerType;
        let revieweeId;
        if (project.clientId.toString() === userId) {
            reviewerType = 'client';
            revieweeId = project.freelancerId;
        }
        else if (project.freelancerId.toString() === userId) {
            reviewerType = 'freelancer';
            revieweeId = project.clientId;
        }
        else {
            return res.status(403).json({
                success: false,
                message: 'You are not part of this project',
            });
        }
        // Check if review already exists
        const existingReview = await Review_model_1.default.findOne({
            projectId,
            reviewerId: userId,
        });
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this project',
            });
        }
        // Create review
        const review = await Review_model_1.default.create({
            projectId,
            reviewerId: userId,
            revieweeId,
            reviewerType,
            rating,
            comment,
            tags: tags || [],
        });
        // Update user's average rating
        await updateUserAverageRating(revieweeId);
        // Populate reviewer details
        await review.populate('reviewerId', 'firstName lastName profilePicture');
        return res.status(201).json({
            success: true,
            message: 'Review created successfully',
            data: review,
        });
    }
    catch (error) {
        console.error('Create review error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to create review',
        });
    }
};
exports.createReview = createReview;
/**
 * Get reviews for a specific user (freelancer or client)
 */
const getUserReviews = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const reviews = await Review_model_1.default.find({
            revieweeId: userId,
            isPublic: true,
            isFlagged: false,
        })
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .populate('reviewerId', 'firstName lastName profilePicture')
            .populate('projectId', 'title');
        const total = await Review_model_1.default.countDocuments({
            revieweeId: userId,
            isPublic: true,
            isFlagged: false,
        });
        return res.status(200).json({
            success: true,
            data: reviews,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error('Get user reviews error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch reviews',
        });
    }
};
exports.getUserReviews = getUserReviews;
/**
 * Get review statistics for a user
 */
const getUserReviewStats = async (req, res) => {
    try {
        const { userId } = req.params;
        const reviews = await Review_model_1.default.find({
            revieweeId: userId,
            isPublic: true,
            isFlagged: false,
        });
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
            : 0;
        // Rating distribution
        const ratingDistribution = {
            5: reviews.filter(r => r.rating === 5).length,
            4: reviews.filter(r => r.rating === 4).length,
            3: reviews.filter(r => r.rating === 3).length,
            2: reviews.filter(r => r.rating === 2).length,
            1: reviews.filter(r => r.rating === 1).length,
        };
        return res.status(200).json({
            success: true,
            data: {
                totalReviews,
                averageRating: Number(averageRating.toFixed(2)),
                ratingDistribution,
            },
        });
    }
    catch (error) {
        console.error('Get review stats error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch review statistics',
        });
    }
};
exports.getUserReviewStats = getUserReviewStats;
/**
 * Respond to a review
 */
const respondToReview = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.user?.userId;
        const { reviewId } = req.params;
        const { response } = req.body;
        if (!response || response.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Response cannot be empty',
            });
        }
        const review = await Review_model_1.default.findById(reviewId);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }
        // Only the reviewee can respond
        if (review.revieweeId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only respond to reviews about you',
            });
        }
        review.response = response;
        review.respondedAt = new Date();
        await review.save();
        return res.status(200).json({
            success: true,
            message: 'Response added successfully',
            data: review,
        });
    }
    catch (error) {
        console.error('Respond to review error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to respond to review',
        });
    }
};
exports.respondToReview = respondToReview;
/**
 * Mark review as helpful/not helpful
 */
const voteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { helpful } = req.body; // true or false
        const review = await Review_model_1.default.findById(reviewId);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }
        if (helpful) {
            review.helpfulCount += 1;
        }
        else {
            review.notHelpfulCount += 1;
        }
        await review.save();
        return res.status(200).json({
            success: true,
            message: 'Vote recorded',
            data: {
                helpfulCount: review.helpfulCount,
                notHelpfulCount: review.notHelpfulCount,
            },
        });
    }
    catch (error) {
        console.error('Vote review error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to vote on review',
        });
    }
};
exports.voteReview = voteReview;
/**
 * Flag a review
 */
const flagReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { reason } = req.body;
        const review = await Review_model_1.default.findById(reviewId);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }
        review.isFlagged = true;
        review.flagReason = reason;
        await review.save();
        return res.status(200).json({
            success: true,
            message: 'Review flagged for moderation',
        });
    }
    catch (error) {
        console.error('Flag review error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to flag review',
        });
    }
};
exports.flagReview = flagReview;
/**
 * Update review (edit)
 */
const updateReview = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.user?.userId;
        const { reviewId } = req.params;
        const { rating, comment, tags } = req.body;
        const review = await Review_model_1.default.findById(reviewId);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }
        // Only reviewer can edit
        if (review.reviewerId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only edit your own reviews',
            });
        }
        if (rating) {
            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Rating must be between 1 and 5',
                });
            }
            review.rating = rating;
        }
        if (comment)
            review.comment = comment;
        if (tags)
            review.tags = tags;
        await review.save();
        // Update user's average rating
        await updateUserAverageRating(review.revieweeId);
        return res.status(200).json({
            success: true,
            message: 'Review updated successfully',
            data: review,
        });
    }
    catch (error) {
        console.error('Update review error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to update review',
        });
    }
};
exports.updateReview = updateReview;
/**
 * Helper function to update user's average rating
 */
async function updateUserAverageRating(userId) {
    try {
        const reviews = await Review_model_1.default.find({
            revieweeId: userId,
            isPublic: true,
            isFlagged: false,
        });
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
            : 0;
        await user_model_1.default.findByIdAndUpdate(userId, {
            'profile.rating': Number(averageRating.toFixed(2)),
            'profile.totalReviews': totalReviews,
        });
    }
    catch (error) {
        console.error('Update average rating error:', error);
    }
}
/**
 * Get all reviews for admin (no auth required)
 */
const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review_model_1.default.find()
            .populate('reviewerId', 'firstName lastName email profileImage')
            .populate('revieweeId', 'firstName lastName email profileImage')
            .populate('projectId', 'title description')
            .sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            data: reviews,
            count: reviews.length,
        });
    }
    catch (error) {
        console.error('Get all reviews error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch reviews',
        });
    }
};
exports.getAllReviews = getAllReviews;
