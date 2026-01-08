import { IScraper, ExternalGig } from "../types";
import { ConnectaService } from "./connecta.service";
import { DiffService } from "./diff.service";
import { logger } from "../utils/logger";
import { config } from "../config/env";

export class ScraperService {
    private connectaService: ConnectaService;
    private diffService: DiffService;
    private isRunning = false;

    constructor() {
        this.connectaService = new ConnectaService();
        this.diffService = new DiffService();
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
     * Run a single scraper with retry logic
     */
    private async runScraper(scraper: IScraper): Promise<void> {
        logger.info(`🔍 Running scraper: ${scraper.name}`);

        let attempts = 0;
        const maxRetries = config.scraping.maxRetries;

        while (attempts < maxRetries) {
            try {
                // Scrape jobs
                const currentGigs = await scraper.scrape();
                logger.info(`📥 Scraped ${currentGigs.length} gigs from ${scraper.name}`);

                if (currentGigs.length === 0) {
                    logger.warn(`⚠️ No gigs found for ${scraper.name}`);
                    return;
                }

                // Get existing gigs from Connecta
                const previousGigs = await this.connectaService.getExternalGigs(scraper.name);

                // Calculate diff
                const { toCreateOrUpdate, toDelete } = this.diffService.compare(
                    currentGigs,
                    previousGigs
                );

                // Create/update gigs
                for (const gig of toCreateOrUpdate) {
                    await this.connectaService.createOrUpdateGig(gig);
                }

                // Delete removed gigs
                for (const { source, externalId } of toDelete) {
                    await this.connectaService.deleteGig(source, externalId);
                }

                logger.info(`✅ Completed scraper: ${scraper.name}`);
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
