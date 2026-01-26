import User from "../models/user.model.js";
import Profile from "../models/Profile.model.js";
import { Job } from "../models/Job.model.js";
import { TFIDF } from "../utils/tfidf.js";

export class RecommendationService {
    /**
     * Get job recommendations for a specific user based on their profile.
     * @param userId The ID of the user to get recommendations for.
     * @param limit The maximum number of recommendations to return.
     */
    public async getRecommendationsForUser(userId: string, limit: number = 10) {
        try {
            // 1. Fetch User and Profile
            const user = await User.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }

            const profile = await Profile.findOne({ user: userId });
            if (!profile) {
                // If no profile, return latest jobs or empty
                return await Job.find({ status: "active" }).sort({ createdAt: -1 }).limit(limit);
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
            const jobs = await Job.find({ status: "active" });

            if (jobs.length === 0) {
                return [];
            }

            // 4. Prepare Documents for TF-IDF
            const tfidf = new TFIDF();

            jobs.forEach(job => {
                // Combine job title, description, skills, requirements, category
                let jobText = `${job.title} ${job.description} ${job.category || ""} `;
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
            const recommendations = tfidf.getRecommendations(userProfileText, limit * 3); // Get more to re-rank

            // 6. Re-rank based on business logic (Internal first, Category match)
            const userCategories = new Set(profile.jobCategories || []);
            const userTitle = profile.jobTitle?.toLowerCase() || "";

            const scoredJobs = recommendations.map(rec => {
                const job = jobs[rec.index];
                let score = rec.score;

                // Boost internal jobs
                if (!job.isExternal) {
                    score += 0.5;
                }

                // Boost category match
                if (job.category && userCategories.has(job.category)) {
                    score += 0.3;
                }

                // Boost title match
                if (userTitle && job.title.toLowerCase().includes(userTitle)) {
                    score += 0.3;
                }

                return { job, score };
            });

            // Sort by new score
            scoredJobs.sort((a, b) => b.score - a.score);

            return scoredJobs.slice(0, limit).map(item => ({
                ...item.job.toObject(),
                matchScore: item.score
            }));

        } catch (error) {
            console.error("Error generating recommendations:", error);
            throw error;
        }
    }

    /**
     * Match a newly created job against all freelancer profiles.
     * If relevance > 85%, store the match and potentially send an immediate email.
     */
    public async processNewJob(jobId: string) {
        try {
            const job = await Job.findById(jobId);
            if (!job || job.status !== 'active') return;

            // 1. Get all freelancer profiles
            const profiles = await Profile.find({
                jobNotificationFrequency: { $in: ['daily', 'weekly', 'relevant_only'] }
            }).populate('user', 'firstName email');

            const jobSkills = new Set(job.skills || []);
            const jobCategory = job.category;
            const jobTitle = job.title.toLowerCase();

            const matches = [];
            const JobMatch = (await import("../models/JobMatch.model")).default;
            const { sendGigNotificationEmail } = await import("./email.service");

            for (const profile of profiles) {
                let score = 0;
                let maxPossibleScore = 4.0; // Skills (1.0) + Category (0.5) + Title (0.5) + Internal (2.0)

                // 1. Skill Match (0 to 1.0)
                if (profile.skills && profile.skills.length > 0) {
                    let matchCount = 0;
                    job.skills.forEach(s => {
                        if (profile.skills!.includes(s)) matchCount++;
                    });
                    score += (matchCount / Math.max(job.skills.length, 1)) * 1.0;
                }

                // 2. Category Match (0.5)
                if (jobCategory && profile.jobCategories?.includes(jobCategory)) {
                    score += 0.5;
                }

                // 3. Title Match (0.5)
                if (profile.jobTitle && jobTitle.includes(profile.jobTitle.toLowerCase())) {
                    score += 0.5;
                }

                // 4. Internal Job Boost (2.0)
                if (!job.isExternal) {
                    score += 2.0;
                }

                // Calculate percentage (0 to 100)
                const relevancePercentage = (score / maxPossibleScore) * 100;

                // Threshold: 85%
                if (relevancePercentage >= 85) {
                    const frequency = profile.jobNotificationFrequency || 'relevant_only';

                    // Store the match
                    await JobMatch.create({
                        user: profile.user,
                        job: job._id,
                        score: relevancePercentage,
                        notificationFrequency: frequency,
                        isEmailed: frequency === 'relevant_only' // Will be emailed immediately
                    });

                    // If 'relevant_only', send email immediately
                    if (frequency === 'relevant_only') {
                        const user: any = profile.user;
                        if (user && user.email) {
                            // Send Email
                            await sendGigNotificationEmail(
                                user.email,
                                user.firstName || 'Freelancer',
                                job.title,
                                `https://myconnecta.ng/jobs/${job._id}`,
                                job.skills
                            );

                            // Create In-App Notification
                            const Notification = (await import("../models/Notification.model")).default;
                            await Notification.create({
                                userId: user._id,
                                type: 'gig_matched',
                                title: 'New Relevant Gig Found!',
                                message: `We found a new gig that matches your skills: "${job.title}". Check it out now!`,
                                relatedId: job._id,
                                relatedType: 'job',
                                link: `/jobs/${job._id}`,
                                priority: 'high',
                                icon: 'auto-awesome'
                            });
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error in processNewJob:", error);
        }
    }
}
