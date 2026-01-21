import * as cron from "node-cron";
import Job from "../models/Job.model";
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
            }
            else {
                console.log("ℹ️ No expired external gigs found");
            }
        }
        catch (error) {
            console.error("❌ Error in expired gigs cleanup cron:", error.message);
        }
    });
    console.log("✅ Cron jobs initialized");
};
