import express from 'express';
import { getAllReviews, getFeaturedTestimonials, createGuestReview } from '../controllers/review.controller.js';
import { createReview, getUserReviews, getUserReviewStats, respondToReview, voteReview, flagReview, updateReview, } from '../controllers/review.controller.js';
import { authenticate } from '../core/middleware/auth.middleware.js';
const router = express.Router();
// Public: Get featured testimonials for landing page (no auth)
router.get('/featured', getFeaturedTestimonials);
// Public: Submit guest review
router.post('/guest', createGuestReview);
// Admin: Get all reviews (no auth)
router.get('/admin/all', getAllReviews);
// Create review (protected)
router.post('/', authenticate, createReview);
// Get reviews for a user (public)
router.get('/user/:userId', getUserReviews);
// Get review statistics for a user (public)
router.get('/user/:userId/stats', getUserReviewStats);
// Respond to a review (protected)
router.post('/:reviewId/respond', authenticate, respondToReview);
// Vote on review helpful/not helpful (protected)
router.post('/:reviewId/vote', authenticate, voteReview);
// Flag a review (protected)
router.post('/:reviewId/flag', authenticate, flagReview);
// Update a review (protected)
router.put('/:reviewId', authenticate, updateReview);
export default router;
