"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cron_1 = require("./scheduler/cron");
const jobberman_scraper_1 = require("./scrapers/jobberman.scraper");
const myjobmag_scraper_1 = require("./scrapers/myjobmag.scraper");
const weworkremotely_scraper_1 = require("./scrapers/weworkremotely.scraper");
const logger_1 = require("./utils/logger");
const env_1 = require("./config/env");
/**
 * Main entry point for the scraper service
 */
async function main() {
    logger_1.logger.info("🚀 Connecta Scraper Service Starting...");
    logger_1.logger.info(`📡 Connecta API: ${env_1.config.connecta.apiUrl}`);
    logger_1.logger.info(`⏰ Scrape interval: Every ${env_1.config.scraping.intervalHours} hours`);
    // Initialize scrapers
    const scrapers = [
        new jobberman_scraper_1.JobbermanScraper(),
        new myjobmag_scraper_1.MyJobMagScraper(),
        new weworkremotely_scraper_1.WeWorkRemotelyScraper(),
        // new TestScraper(), // Disabled for production
    ];
    logger_1.logger.info(`📋 Loaded ${scrapers.length} scraper(s): ${scrapers.map((s) => s.name).join(", ")}`);
    // Initialize scheduler (used here just for the runNow wrapper)
    const scheduler = new cron_1.CronScheduler(scrapers);
    // Run once and exit (PM2 will handle the daily restart)
    logger_1.logger.info("🔄 Starting scraping job (PM2 managed)...");
    await scheduler.runNow();
    logger_1.logger.info("✅ Scraping completed. Exiting...");
    process.exit(0);
}
// Error handling
process.on("unhandledRejection", (error) => {
    logger_1.logger.error(`❌ Unhandled rejection: ${error.message}`);
    logger_1.logger.error(error.stack);
});
process.on("SIGINT", () => {
    logger_1.logger.info("👋 Shutting down gracefully...");
    process.exit(0);
});
process.on("SIGTERM", () => {
    logger_1.logger.info("👋 Shutting down gracefully...");
    process.exit(0);
});
// Start the service
main().catch((error) => {
    logger_1.logger.error(`❌ Fatal error: ${error.message}`);
    logger_1.logger.error(error.stack);
    process.exit(1);
});
