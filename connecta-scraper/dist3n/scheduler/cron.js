"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronScheduler = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const scraper_service_1 = require("../services/scraper.service");
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
class CronScheduler {
    constructor(scrapers) {
        this.scraperService = new scraper_service_1.ScraperService();
        this.scrapers = scrapers;
    }
    /**
     * Start the cron scheduler
     */
    start() {
        const intervalHours = env_1.config.scraping.intervalHours;
        // Convert hours to cron expression
        // Run at midnight every N hours: 0 */N * * *
        const cronExpression = `0 */${intervalHours} * * *`;
        logger_1.logger.info(`⏰ Scheduling scraper to run every ${intervalHours} hours`);
        logger_1.logger.info(`📅 Cron expression: ${cronExpression}`);
        node_cron_1.default.schedule(cronExpression, async () => {
            logger_1.logger.info("⏰ Cron job triggered");
            await this.scraperService.runAll(this.scrapers);
        });
        logger_1.logger.info("✅ Cron scheduler started successfully");
    }
    /**
     * Run immediately (for manual trigger)
     */
    async runNow() {
        logger_1.logger.info("🚀 Manual trigger: Running scrapers now...");
        await this.scraperService.runAll(this.scrapers);
    }
}
exports.CronScheduler = CronScheduler;
