import { IScraper, ExternalGig } from "../types";
import { ConnectaService } from "./connecta.service";
import { DiffService } from "./diff.service";
import { JobValidatorService } from "./job-validator.service";
import { CategoryClassifierService } from "./category-classifier.service";
import { logger } from "../utils/logger";
import { config } from "../config/env";

export class ScraperService {
    private connectaService: ConnectaService;
    private diffService: DiffService;
    private validatorService: JobValidatorService;
    private classifierService: CategoryClassifierService;
    private isRunning = false;

    constructor() {
        this.connectaService = new ConnectaService();
        this.diffService = new DiffService();
        this.validatorService = new JobValidatorService();
        this.classifierService = new CategoryClassifierService();
    }

    /**
     * Run all scrapers
     */
    async runAll(scrapers: IScraper[]): Promise<void> {
        if (this.isRunning) {
            logger.warn("⚠️ Scraping already in progress, skipping...");
            return;
        }

        this.isRunning = true;
        logger.info("🚀 Starting scraping job...");

        try {
            for (const scraper of scrapers) {
                await this.runScraper(scraper);
            }
        } finally {
            this.isRunning = false;
            logger.info("✅ Scraping job completed");
        }
    }

    /**
     * Run a single scraper with retry logic, validation, and categorization
     */
    private async runScraper(scraper: IScraper): Promise<void> {
        logger.info(`🔍 Running scraper: ${scraper.name}`);

        let attempts = 0;
        const maxRetries = config.scraping.maxRetries;

        while (attempts < maxRetries) {
            try {
                // Scrape jobs
                const scrapedGigs = await scraper.scrape();
                logger.info(`📥 Scraped ${scrapedGigs.length} gigs from ${scraper.name}`);

                if (scrapedGigs.length === 0) {
                    logger.warn(`⚠️ No gigs found for ${scraper.name}`);
                    return;
                }

                // Step 1: Validate all jobs
                logger.info(`🔍 Validating ${scrapedGigs.length} jobs...`);
                const { valid: validGigs, invalid: invalidGigs } = this.validatorService.validateBatch(scrapedGigs);

                if (invalidGigs.length > 0) {
                    logger.warn(`❌ ${invalidGigs.length} jobs failed validation and will be skipped`);
                    invalidGigs.forEach(({ gig, errors }) => {
                        logger.debug(`  - "${gig.title}": ${errors.join(", ")}`);
                    });
                }

                // Step 2: Categorize valid jobs
                logger.info(`📂 Categorizing ${validGigs.length} valid jobs...`);
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
                const { toCreateOrUpdate, toDelete } = this.diffService.compare(
                    enrichedGigs,
                    previousGigs
                );

                // Create/update gigs
                logger.info(`💾 Creating/updating ${toCreateOrUpdate.length} jobs...`);
                let successCount = 0;
                for (const gig of toCreateOrUpdate) {
                    const success = await this.connectaService.createOrUpdateGig(gig);
                    if (success) successCount++;
                }
                logger.info(`✅ Successfully saved ${successCount}/${toCreateOrUpdate.length} jobs`);

                // Note: We don't delete gigs immediately anymore
                // The cleanup service will handle deletion after 14 days
                if (toDelete.length > 0) {
                    logger.info(`📋 ${toDelete.length} jobs no longer found in source (will be cleaned up after 14 days if not reappeared)`);
                }

                logger.info(`✅ Completed scraper: ${scraper.name}`);
                logger.info(`📊 Summary: ${successCount} saved, ${invalidGigs.length} rejected, ${toDelete.length} missing from source`);
                return; // Success, exit retry loop
            } catch (error: any) {
                attempts++;
                logger.error(`❌ Error in ${scraper.name} (attempt ${attempts}/${maxRetries}): ${error.message}`);

                if (attempts < maxRetries) {
                    const delay = config.scraping.retryDelayMs * attempts;
                    logger.info(`⏳ Retrying in ${delay}ms...`);
                    await this.sleep(delay);
                }
            }
        }

        logger.error(`❌ Failed to scrape ${scraper.name} after ${maxRetries} attempts`);
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
