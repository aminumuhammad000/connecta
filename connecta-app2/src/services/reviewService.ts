import { post, get } from './api';

export const createReview = async (data: {
    projectId?: string;
    revieweeId?: string;
    reviewerType?: 'client' | 'freelancer';
    rating: number;
    comment: string;
    tags?: string[];
}) => {
    const response = await post('/api/reviews', data);
    return (response as any)?.data || response;
};

export const getUserReviews = async (userId: string, page = 1, limit = 10) => {
    const response = await get(`/api/reviews/user/${userId}?page=${page}&limit=${limit}`);
    return (response as any)?.data || response;
};

export const getUserReviewStats = async (userId: string) => {
    const response = await get(`/api/reviews/user/${userId}/stats`);
    return (response as any)?.data || response;
};
