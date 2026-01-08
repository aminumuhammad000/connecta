"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCronJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const Job_model_1 = __importDefault(require("../models/Job.model"));
/**
 * Initialize cron jobs
 */
const initCronJobs = () => {
    console.log("⏰ Initializing cron jobs...");
    // Run every hour to delete expired external gigs
    // 0 * * * * = every hour at minute 0
    node_cron_1.default.schedule("0 * * * *", async () => {
        console.log("⏰ Running cleanup for expired gigs...");
        try {
            const now = new Date();
            // Find and delete external gigs where deadline < now
            const result = await Job_model_1.default.deleteMany({
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
exports.initCronJobs = initCronJobs;
