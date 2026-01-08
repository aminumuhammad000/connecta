"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperService = void 0;
const connecta_service_1 = require("./connecta.service");
const diff_service_1 = require("./diff.service");
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
class ScraperService {
    constructor() {
        this.isRunning = false;
        this.connectaService = new connecta_service_1.ConnectaService();
        this.diffService = new diff_service_1.DiffService();
    }
    /**
     * Run all scrapers
     */
    async runAll(scrapers) {
        if (this.isRunning) {
            logger_1.logger.warn("⚠️ Scraping already in progress, skipping...");
            return;
        }
        this.isRunning = true;
        logger_1.logger.info("🚀 Starting scraping job...");
        try {
            for (const scraper of scrapers) {
                await this.runScraper(scraper);
            }
        }
        finally {
            this.isRunning = false;
            logger_1.logger.info("✅ Scraping job completed");
        }
    }
    /**
     * Run a single scraper with retry logic
     */
    async runScraper(scraper) {
        logger_1.logger.info(`🔍 Running scraper: ${scraper.name}`);
        let attempts = 0;
        const maxRetries = env_1.config.scraping.maxRetries;
        while (attempts < maxRetries) {
            try {
                // Scrape jobs
                const currentGigs = await scraper.scrape();
                logger_1.logger.info(`📥 Scraped ${currentGigs.length} gigs from ${scraper.name}`);
                if (currentGigs.length === 0) {
                    logger_1.logger.warn(`⚠️ No gigs found for ${scraper.name}`);
                    return;
                }
                // Get existing gigs from Connecta
                const previousGigs = await this.connectaService.getExternalGigs(scraper.name);
                // Calculate diff
                const { toCreateOrUpdate, toDelete } = this.diffService.compare(currentGigs, previousGigs);
                // Create/update gigs
                for (const gig of toCreateOrUpdate) {
                    await this.connectaService.createOrUpdateGig(gig);
                }
                // Delete removed gigs
                for (const { source, externalId } of toDelete) {
                    await this.connectaService.deleteGig(source, externalId);
                }
                logger_1.logger.info(`✅ Completed scraper: ${scraper.name}`);
                return; // Success, exit retry loop
            }
            catch (error) {
                attempts++;
                logger_1.logger.error(`❌ Error in ${scraper.name} (attempt ${attempts}/${maxRetries}): ${error.message}`);
                if (attempts < maxRetries) {
                    const delay = env_1.config.scraping.retryDelayMs * attempts;
                    logger_1.logger.info(`⏳ Retrying in ${delay}ms...`);
                    await this.sleep(delay);
                }
            }
        }
        logger_1.logger.error(`❌ Failed to scrape ${scraper.name} after ${maxRetries} attempts`);
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.ScraperService = ScraperService;
