import * as cron from "node-cron";
import mongoose from "mongoose";
import "../models/Job.model";
const Job = mongoose.model("Job");

/**
 * Initialize cron jobs
 */
export const initCronJobs = () => {
    console.log("⏰ Initializing cron jobs...");

    // Run every hour to delete expired external gigs
    // 0 * * * * = every hour at minute 0
    cron.schedule("0 * * * *", async () => {
        console.log("⏰ Running cleanup for expired gigs...");
        try {
            const now = new Date();

            // Find and delete external gigs where deadline < now
            const result = await Job.deleteMany({
                isExternal: true,
                deadline: { $lt: now }
            });

            if (result.deletedCount > 0) {
                console.log(`✅ Deleted ${result.deletedCount} expired external gigs`);
            } else {
                console.log("ℹ️ No expired external gigs found");
            }
        } catch (error: any) {
            console.error("❌ Error in expired gigs cleanup cron:", error.message);
        }
    });

    console.log("✅ Cron jobs initialized");
};

/**
 * Send batch job match emails
 * @param frequency 'daily' | 'weekly'
 */
async function sendBatchJobMatchEmails(frequency: 'daily' | 'weekly') {
    console.log(`⏰ Running ${frequency} job match email batch...`);
    try {
        const JobMatch = (await import("../models/JobMatch.model")).default;
        const { sendEmail } = await import("./email.service");
        const { getBaseTemplate } = await import("../utils/emailTemplates");

        // 1. Find all un-emailed matches for this frequency
        const matches = await JobMatch.find({
            notificationFrequency: frequency,
            isEmailed: false
        }).populate('user', 'firstName email').populate('job', 'title skills');

        if (matches.length === 0) {
            console.log(`ℹ️ No pending ${frequency} matches found`);
            return;
        }

        // 2. Group by user
        const userMatches: Record<string, any> = {};
        for (const match of matches) {
            const userId = (match.user as any)._id.toString();
            if (!userMatches[userId]) {
                userMatches[userId] = {
                    user: match.user,
                    jobs: []
                };
            }
            userMatches[userId].jobs.push(match.job);
        }

        // 3. Send emails
        for (const userId in userMatches) {
            const { user, jobs } = userMatches[userId];
            const jobListHtml = jobs.map((job: any) => `
                <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 12px;">
                    <h4 style="margin: 0 0 10px 0; color: #111827;">${job.title}</h4>
                    <div style="margin-bottom: 10px;">
                        ${(job.skills || []).map((s: string) => `<span style="background: #FFF0EB; color: #FD6730; padding: 4px 8px; border-radius: 12px; font-size: 11px; margin-right: 5px; display: inline-block;">${s}</span>`).join('')}
                    </div>
                    <a href="https://myconnecta.ng/jobs/${job._id}" style="color: #FD6730; font-size: 13px; font-weight: 600; text-decoration: none;">View Details →</a>
                </div>
            `).join('');

            const subject = frequency === 'daily' ? "Your Daily Gig Matches" : "Your Weekly Gig Digest";
            const title = frequency === 'daily' ? "Daily Matches" : "Weekly Digest";

            const html = getBaseTemplate({
                title: `New Gigs Found for You! 🚀`,
                subject: subject,
                content: `
                    <p>Hi ${user.firstName || 'Freelancer'},</p>
                    <p>We found ${jobs.length} new gigs that match your profile perfectly. Take a look:</p>
                    <div style="margin-top: 25px;">
                        ${jobListHtml}
                    </div>
                    <p style="margin-top: 30px; font-size: 12px; color: #9CA3AF;">
                        You're receiving this because your notification frequency is set to ${frequency}. 
                        You can change this anytime in your profile settings.
                    </p>
                `,
                actionUrl: 'https://myconnecta.ng/jobs',
                actionText: 'View All Gigs'
            });

            await sendEmail(user.email, subject, html);

            // 4. Mark as emailed
            await JobMatch.updateMany(
                { user: user._id, notificationFrequency: frequency, isEmailed: false },
                { isEmailed: true }
            );
        }

        console.log(`✅ Finished ${frequency} job match email batch`);
    } catch (error: any) {
        console.error(`❌ Error in ${frequency} job match cron:`, error.message);
    }
}

// Daily at 8:00 AM
cron.schedule("0 8 * * *", () => sendBatchJobMatchEmails('daily'));

// Weekly on Monday at 8:00 AM
cron.schedule("0 8 * * 1", () => sendBatchJobMatchEmails('weekly'));

