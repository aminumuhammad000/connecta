import { get, post } from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { Review, ReviewStats } from '../types';

/**
 * Review Service
 * Handles review and rating-related API calls
 */

/**
 * Create a review
 */
export const createReview = async (reviewData: {
    projectId: string;
    revieweeId: string;
    rating: number;
    comment: string;
}): Promise<Review> => {
    const response = await post<Review>(API_ENDPOINTS.REVIEWS, reviewData);
    return response.data!;
};

/**
 * Get reviews for a user
 */
export const getUserReviews = async (userId: string): Promise<Review[]> => {
    const response = await get<Review[]>(API_ENDPOINTS.USER_REVIEWS(userId));
    return Array.isArray(response) ? response : (response as any)?.data || [];
};

/**
 * Get review statistics for a user
 */
export const getReviewStats = async (userId: string): Promise<ReviewStats> => {
    const response = await get<ReviewStats>(API_ENDPOINTS.REVIEW_STATS(userId));
    return response.data!;
};

/**
 * Respond to a review
 */
export const respondToReview = async (reviewId: string, response: string): Promise<Review> => {
    const result = await post<Review>(`${API_ENDPOINTS.REVIEWS}/${reviewId}/respond`, { response });
    return result.data!;
};

export default {
    createReview,
    getUserReviews,
    getReviewStats,
    respondToReview,
};
