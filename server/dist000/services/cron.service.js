"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCronJobs = void 0;
const cron = __importStar(require("node-cron"));
const Job_model_1 = __importDefault(require("../models/Job.model"));
/**
 * Initialize cron jobs
 */
const initCronJobs = () => {
    console.log("⏰ Initializing cron jobs...");
    // Run every hour to delete expired external gigs
    // 0 * * * * = every hour at minute 0
    cron.schedule("0 * * * *", async () => {
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
