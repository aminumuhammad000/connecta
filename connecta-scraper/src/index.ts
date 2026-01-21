import { CronScheduler } from "./scheduler/cron";
import { JobbermanScraper } from "./scrapers/jobberman.scraper";
import { MyJobMagScraper } from "./scrapers/myjobmag.scraper";
import { WeWorkRemotelyScraper } from "./scrapers/weworkremotely.scraper";
import { CleanupService } from "./services/cleanup.service";
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

    // Initialize scheduler (used here just for the runNow wrapper)
    const scheduler = new CronScheduler(scrapers);

    // Initialize cleanup service
    const cleanupService = new CleanupService();

    // Run scraping job
    logger.info("🔄 Starting scraping job (PM2 managed)...");
    await scheduler.runNow();
    logger.info("✅ Scraping completed.");

    // Run cleanup to enforce 14-day deletion policy
    logger.info("🧹 Running cleanup service...");
    try {
        await cleanupService.cleanupStaleExternalGigs();
        const stats = await cleanupService.getExternalGigStats();
        logger.info(`📊 External Gigs Stats: Total: ${stats.total}, Active (7 days): ${stats.recentlyActive}, Stale (14+ days): ${stats.stale}`);
    } catch (error: any) {
        logger.error(`❌ Cleanup failed: ${error.message}`);
    }

    logger.info("✅ All tasks completed. Exiting...");
    process.exit(0);
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
