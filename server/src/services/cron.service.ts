import * as cron from "node-cron";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Profile from "../models/Profile.model.js";
import { sendProfileReminderEmail } from "./email.service.js";
import twilioService from "./twilio.service.js";
import { Job } from "../models/Job.model.js";

/**
 * Initialize cron jobs
 */
export const initCronJobs = () => {
    console.log("⏰ Initializing cron jobs...");

    // Run every hour to remind users with incomplete profiles
    cron.schedule("0 * * * *", async () => {
        await checkIncompleteProfiles();
    });

    console.log("✅ Cron jobs initialized");
};

/**
 * Check for users who registered 24h ago but haven't completed their profile
 */
async function checkIncompleteProfiles() {
    console.log("⏰ Checking for incomplete profiles (24h reminder)...");
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

        // Find users who registered between 24 and 48 hours ago
        // and haven't been sent a reminder yet
        const users = await User.find({
            createdAt: { $gte: fortyEightHoursAgo, $lte: twentyFourHoursAgo },
            profileReminderSent: { $ne: true },
            userType: { $ne: "admin" } // Don't remind admins
        });

        if (users.length === 0) {
            console.log("ℹ️ No users found for 24h profile reminder");
            return;
        }

        console.log(`📣 Found ${users.length} potential users for profile reminder`);

        for (const user of users) {
            // Check profile
            const profile = await Profile.findOne({ user: user._id });

            const isIncomplete = !profile ||
                (user.userType === 'freelancer' && (!profile.bio || !profile.subSkills || profile.subSkills.length === 0)) ||
                ((user.userType === 'client') && (!profile.bio));

            if (isIncomplete) {
                console.log(`📧 Sending reminder to ${user.email}...`);

                // 1. Send Email
                await sendProfileReminderEmail(user.email, user.firstName);

                // 2. Send WhatsApp if phone number exists
                if (user.phoneNumber) {
                    const whatsappMsg = `Hi ${user.firstName}! 👋 We noticed you haven't completed your profile on Connecta yet. A complete profile helps you stand out and get 5x more opportunities! Complete it here: https://app.myconnecta.ng/settings/profile`;
                    await twilioService.sendWhatsAppMessage(user.phoneNumber, whatsappMsg);
                }

                // 3. Mark as sent
                await User.updateOne({ _id: user._id }, { profileReminderSent: true });
                console.log(`✅ Reminder sent to ${user.firstName} (${user.email})`);
            } else {
                // If profile is complete, just mark as sent so we don't check again
                await User.updateOne({ _id: user._id }, { profileReminderSent: true });
                console.log(`ℹ️ User ${user.email} already has a complete profile`);
            }
        }
    } catch (error: any) {
        console.error("❌ Error in profile reminder cron:", error.message);
    }
}

/**
 * Send batch job match emails
 * @param frequency 'daily' | 'weekly'
 */
async function sendBatchJobMatchEmails(frequency: 'daily' | 'weekly') {
    console.log(`⏰ Running ${frequency} job match email batch...`);
    try {
        const JobMatch = (await import("../models/JobMatch.model.js")).default;
        const { sendEmail } = await import("./email.service.js");
        const { getBaseTemplate } = await import("../utils/emailTemplates.js");

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

