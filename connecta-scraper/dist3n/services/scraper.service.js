"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperService = void 0;
const connecta_service_1 = require("./connecta.service");
const diff_service_1 = require("./diff.service");
const job_validator_service_1 = require("./job-validator.service");
const category_classifier_service_1 = require("./category-classifier.service");
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
class ScraperService {
    constructor() {
        this.isRunning = false;
        this.connectaService = new connecta_service_1.ConnectaService();
        this.diffService = new diff_service_1.DiffService();
        this.validatorService = new job_validator_service_1.JobValidatorService();
        this.classifierService = new category_classifier_service_1.CategoryClassifierService();
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
     * Run a single scraper with retry logic, validation, and categorization
     */
    async runScraper(scraper) {
        logger_1.logger.info(`🔍 Running scraper: ${scraper.name}`);
        let attempts = 0;
        const maxRetries = env_1.config.scraping.maxRetries;
        while (attempts < maxRetries) {
            try {
                // Scrape jobs
                const scrapedGigs = await scraper.scrape();
                logger_1.logger.info(`📥 Scraped ${scrapedGigs.length} gigs from ${scraper.name}`);
                if (scrapedGigs.length === 0) {
                    logger_1.logger.warn(`⚠️ No gigs found for ${scraper.name}`);
                    return;
                }
                // Step 1: Validate all jobs
                logger_1.logger.info(`🔍 Validating ${scrapedGigs.length} jobs...`);
                const { valid: validGigs, invalid: invalidGigs } = this.validatorService.validateBatch(scrapedGigs);
                if (invalidGigs.length > 0) {
                    logger_1.logger.warn(`❌ ${invalidGigs.length} jobs failed validation and will be skipped`);
                    invalidGigs.forEach(({ gig, errors }) => {
                        logger_1.logger.debug(`  - "${gig.title}": ${errors.join(", ")}`);
                    });
                }
                // Step 2: Categorize valid jobs
                logger_1.logger.info(`📂 Categorizing ${validGigs.length} valid jobs...`);
                const categorizedGigs = this.classifierService.classifyBatch(validGigs);
                // Step 3: Add metadata timestamps
                const now = new Date().toISOString();
                const enrichedGigs = categorizedGigs.map(gig => ({
                    ...gig,
                    lastScrapedAt: now,
                    firstScrapedAt: now, // Will be overridden if job already exists
                }));
                // Get existing gigs from Connecta
                const previousGigs = await this.connectaService.getExternalGigs(scraper.name);
                // Calculate diff
                const { toCreateOrUpdate, toDelete } = this.diffService.compare(enrichedGigs, previousGigs);
                // Create/update gigs
                logger_1.logger.info(`💾 Creating/updating ${toCreateOrUpdate.length} jobs...`);
                let successCount = 0;
                for (const gig of toCreateOrUpdate) {
                    const success = await this.connectaService.createOrUpdateGig(gig);
                    if (success)
                        successCount++;
                }
                logger_1.logger.info(`✅ Successfully saved ${successCount}/${toCreateOrUpdate.length} jobs`);
                // Note: We don't delete gigs immediately anymore
                // The cleanup service will handle deletion after 14 days
                if (toDelete.length > 0) {
                    logger_1.logger.info(`📋 ${toDelete.length} jobs no longer found in source (will be cleaned up after 14 days if not reappeared)`);
                }
                logger_1.logger.info(`✅ Completed scraper: ${scraper.name}`);
                logger_1.logger.info(`📊 Summary: ${successCount} saved, ${invalidGigs.length} rejected, ${toDelete.length} missing from source`);
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
