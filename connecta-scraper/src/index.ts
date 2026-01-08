import { CronScheduler } from "./scheduler/cron";
import { JobbermanScraper } from "./scrapers/jobberman.scraper";
import { MyJobMagScraper } from "./scrapers/myjobmag.scraper";
import { WeWorkRemotelyScraper } from "./scrapers/weworkremotely.scraper";
import { logger } from "./utils/logger";
import { config } from "./config/env";

/**
 * Main entry point for the scraper service
 */
async function main() {
    logger.info("🚀 Connecta Scraper Service Starting...");
    logger.info(`📡 Connecta API: ${config.connecta.apiUrl}`);
    logger.info(`⏰ Scrape interval: Every ${config.scraping.intervalHours} hours`);

    // Initialize scrapers
    const scrapers = [
        new JobbermanScraper(),
        new MyJobMagScraper(),
        new WeWorkRemotelyScraper(),
        // new TestScraper(), // Disabled for production
    ];

    logger.info(`📋 Loaded ${scrapers.length} scraper(s): ${scrapers.map((s) => s.name).join(", ")}`);

    // Initialize scheduler
    const scheduler = new CronScheduler(scrapers);

    // Check if manual trigger is requested
    const isManual = process.argv.includes("--manual");

    if (isManual) {
        // Run once and exit
        logger.info("🔧 Manual mode: Running once then exiting...");
        await scheduler.runNow();
        logger.info("✅ Manual run completed. Exiting...");
        process.exit(0);
    } else {
        // Start cron scheduler
        logger.info("🔄 Starting automated scheduler...");
        scheduler.start();

        // Run immediately on startup
        logger.info("🏁 Running initial scrape...");
        await scheduler.runNow();

        // Keep process alive
        logger.info("✅ Service is now running. Press Ctrl+C to stop.");
    }
}

// Error handling
process.on("unhandledRejection", (error: any) => {
    logger.error(`❌ Unhandled rejection: ${error.message}`);
    logger.error(error.stack);
});

process.on("SIGINT", () => {
    logger.info("👋 Shutting down gracefully...");
    process.exit(0);
});

process.on("SIGTERM", () => {
    logger.info("👋 Shutting down gracefully...");
    process.exit(0);
});

// Start the service
main().catch((error) => {
    logger.error(`❌ Fatal error: ${error.message}`);
    logger.error(error.stack);
    process.exit(1);
});
