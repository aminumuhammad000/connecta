import axios from "axios";
import { API_BASE_URL } from "../utils/constants";

const API_URL = API_BASE_URL;

/**
 * Fetch featured testimonials for the landing page
 */
export const getFeaturedTestimonials = async (limit: number = 6) => {
    try {
        const response = await axios.get(`${API_URL}/reviews/featured`, {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        throw error;
    }
};

/**
 * Submit a guest review
 */
export const submitGuestReview = async (data: {
    name: string;
    email?: string;
    role?: string;
    rating: number;
    comment: string;
}) => {
    try {
        const response = await axios.post(`${API_URL}/reviews/guest`, data);
        return response.data;
    } catch (error) {
        console.error('Error submitting review:', error);
        throw error;
    }
};
