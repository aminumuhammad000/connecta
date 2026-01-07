"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationService = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const Profile_model_1 = __importDefault(require("../models/Profile.model"));
const Job_model_1 = __importDefault(require("../models/Job.model"));
const tfidf_1 = require("../utils/tfidf");
class RecommendationService {
    /**
     * Get job recommendations for a specific user based on their profile.
     * @param userId The ID of the user to get recommendations for.
     * @param limit The maximum number of recommendations to return.
     */
    async getRecommendationsForUser(userId, limit = 10) {
        try {
            // 1. Fetch User and Profile
            const user = await user_model_1.default.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }
            const profile = await Profile_model_1.default.findOne({ user: userId });
            if (!profile) {
                // If no profile, return latest jobs or empty
                return await Job_model_1.default.find({ status: "active" }).sort({ createdAt: -1 }).limit(limit);
            }
            // 2. Construct User Profile Text
            // Combine skills, bio, job title (if available in future), etc.
            let userProfileText = "";
            if (profile.skills && profile.skills.length > 0) {
                userProfileText += profile.skills.join(" ") + " ";
            }
            if (profile.bio) {
                userProfileText += profile.bio + " ";
            }
            // Add education fields if relevant
            if (profile.education && profile.education.length > 0) {
                profile.education.forEach(edu => {
                    userProfileText += `${edu.fieldOfStudy} ${edu.degree} `;
                });
            }
            // Add employment history
            if (profile.employment && profile.employment.length > 0) {
                profile.employment.forEach(emp => {
                    userProfileText += `${emp.position} ${emp.description || ""} `;
                });
            }
            // 3. Fetch Active Jobs
            const jobs = await Job_model_1.default.find({ status: "active" });
            if (jobs.length === 0) {
                return [];
            }
            // 4. Prepare Documents for TF-IDF
            const tfidf = new tfidf_1.TFIDF();
            // We need to keep track of job IDs to map back from indices
            const jobIds = jobs.map(job => job._id);
            jobs.forEach(job => {
                // Combine job title, description, skills, requirements
                let jobText = `${job.title} ${job.description} `;
                if (job.skills && job.skills.length > 0) {
                    jobText += job.skills.join(" ") + " ";
                }
                if (job.requirements && job.requirements.length > 0) {
                    jobText += job.requirements.join(" ") + " ";
                }
                tfidf.addDocument(jobText);
            });
            // 5. Calculate TF-IDF and Get Recommendations
            tfidf.calculateTFIDF();
            const recommendations = tfidf.getRecommendations(userProfileText, limit);
            // 6. Map indices back to Job objects
            const recommendedJobs = recommendations.map(rec => {
                const job = jobs[rec.index];
                return {
                    ...job.toObject(),
                    matchScore: rec.score // Optional: include score for debugging/display
                };
            });
            // Filter out jobs with 0 score if desired, or keep them
            // For now, we return the top matches. 
            // If the user has no relevant profile data, scores might be 0.
            return recommendedJobs;
        }
        catch (error) {
            console.error("Error generating recommendations:", error);
            throw error;
        }
    }
}
exports.RecommendationService = RecommendationService;
