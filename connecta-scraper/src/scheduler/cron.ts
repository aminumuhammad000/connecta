import cron from "node-cron";
import { ScraperService } from "../services/scraper.service";
import { IScraper } from "../types";
import { logger } from "../utils/logger";
import { config } from "../config/env";

export class CronScheduler {
    private scraperService: ScraperService;
    private scrapers: IScraper[];

    constructor(scrapers: IScraper[]) {
        this.scraperService = new ScraperService();
        this.scrapers = scrapers;
    }

    /**
     * Start the cron scheduler
     */
    start(): void {
        const intervalHours = config.scraping.intervalHours;

        // Convert hours to cron expression
        // Run at midnight every N hours: 0 */N * * *
        const cronExpression = `0 */${intervalHours} * * *`;

        logger.info(`⏰ Scheduling scraper to run every ${intervalHours} hours`);
        logger.info(`📅 Cron expression: ${cronExpression}`);

        cron.schedule(cronExpression, async () => {
            logger.info("⏰ Cron job triggered");
            await this.scraperService.runAll(this.scrapers);
        });

        logger.info("✅ Cron scheduler started successfully");
    }

    /**
     * Run immediately (for manual trigger)
     */
    async runNow(): Promise<void> {
        logger.info("🚀 Manual trigger: Running scrapers now...");
        await this.scraperService.runAll(this.scrapers);
    }
}
