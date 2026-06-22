import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Review from '../models/Review.model.js';
import Contract from '../models/Contract.model.js';
export class ReputationService {
    /**
     * Updates the reputation metrics for a specific freelancer.
     * This should be called whenever a job is completed or a review is left.
     * @param userId The ID of the freelancer
     */
    async updateFreelancerReputation(userId) {
        try {
            const userObjectId = new mongoose.Types.ObjectId(userId);
            // 1. Calculate Average Rating & Total Reviews
            const reviews = await Review.find({
                revieweeId: userObjectId,
                reviewerType: 'client', // Only count reviews from clients
            });
            const totalReviews = reviews.length;
            const averageRating = totalReviews > 0
                ? reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews
                : 0;
            // 2. Calculate Job Success Score (JSS)
            // JSS Formula (Simplified): (Successful Contracts / Total Contracts) * 100
            // "Successful" = Completed status + (Rating >= 4 OR No Rating yet) + No Disputes
            const contracts = await Contract.find({
                freelancerId: userObjectId,
                status: { $in: ['completed', 'terminated', 'disputed'] }, // Only consider closed contracts
            });
            let successfulContracts = 0;
            let totalClosedContracts = contracts.length;
            // Map contracts to reviews to check specific job ratings
            const contractReviewMap = new Map();
            reviews.forEach(r => {
                if (r.projectId) {
                    contractReviewMap.set(r.projectId.toString(), r);
                }
            });
            for (const contract of contracts) {
                let isSuccess = false;
                if (contract.status === 'completed') {
                    const review = contractReviewMap.get(contract.projectId.toString());
                    if (review) {
                        if (review.rating >= 4)
                            isSuccess = true;
                    }
                    else {
                        // No review yet, but completed successfully? Count as success for now (or neutral)
                        isSuccess = true;
                    }
                }
                // Terminated or Disputed are failures (metrics penalty)
                if (isSuccess)
                    successfulContracts++;
            }
            let jobSuccessScore = totalClosedContracts > 0
                ? (successfulContracts / totalClosedContracts) * 100
                : 100; // Default to 100 for new users with no history? Or 0? Upwork does not show until enough history.
            // Let's keep it 100 for now if they have NO bad history, but maybe 0 is safer if 0 contracts.
            if (totalClosedContracts === 0)
                jobSuccessScore = 100; // Innocent until proven guilty, or hidden.
            // 3. Determine Badges
            const badges = [];
            const earnings = 0; // TODO: Calculate earnings from payments
            // Badge Logic:
            // Rising Talent: < 5 jobs, 100% JSS, Profile Complete (simplified here)
            if (totalClosedContracts > 0 && totalClosedContracts < 5 && jobSuccessScore >= 90) {
                badges.push('rising_talent');
            }
            // Top Rated: > 5 jobs, > 90% JSS, > 4.5 Stars
            if (totalClosedContracts >= 5 && jobSuccessScore >= 90 && averageRating >= 4.5) {
                badges.push('top_rated');
            }
            // Expert Vetted: Manual assignment usually, but maybe based on high earnings/test scores.
            // Verified Pro: manual or ID verification.
            // 4. Update User Profile
            await User.findByIdAndUpdate(userId, {
                averageRating: Number(averageRating.toFixed(1)), // Keep 1 decimal
                totalReviews,
                jobSuccessScore: Math.round(jobSuccessScore),
                badges,
                // Update performance metrics
                $set: {
                    "performanceMetrics.completionRate": Math.round(jobSuccessScore), // Simplified linkage
                    // In a real app, these would come from message logs and project timelines
                    "performanceMetrics.onTimeDeliveryRate": 95,
                    "performanceMetrics.responseTime": 4, // 4 hours avg (placeholder)
                }
            });
            console.log(`Reputation updated for user ${userId}: ${averageRating} stars, ${jobSuccessScore}% JSS`);
        }
        catch (error) {
            console.error('Error updating freelancer reputation:', error);
            throw error;
        }
    }
    /**
     * Calculates specific skill ratings based on reviews that tagged those skills.
     * (Future implementation)
     */
    async getSkillRatings(userId) {
        // Implementation for detailed skill breakdown
    }
}
export default new ReputationService();
