import { chromium } from "playwright";
import { BaseScraper } from "./base.scraper";
import { ExternalGig } from "../types";
import { logger } from "../utils/logger";

/**
 * Jobberman scraper
 * Scrapes job listings from Jobberman Nigeria
 */
export class JobbermanScraper extends BaseScraper {
    name = "jobberman";
    private baseUrl = "https://www.jobberman.com/jobs";

    async scrape(): Promise<ExternalGig[]> {
        const gigs: ExternalGig[] = [];

        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();

        try {
            logger.info(`🌐 Loading Jobberman jobs page...`);
            await page.goto(this.baseUrl, { waitUntil: "networkidle" });

            // Wait for job listings to load
            // Try multiple selectors
            await page.waitForSelector("a[href*='/listings/']", { timeout: 10000 }).catch(() => {
                logger.warn("⚠️ Job listings not found, trying alternative selector");
            });

            // Extract job listings using a more robust strategy
            // Find all anchor tags that look like job listings
            const jobLinks = await page.$$("a[href*='/listings/']");

            logger.info(`📋 Found ${jobLinks.length} potential job links`);

            const processedUrls = new Set<string>();

            for (const linkElement of jobLinks) {
                try {
                    const link = await linkElement.getAttribute("href");
                    if (!link) continue;

                    const fullUrl = link.startsWith("http") ? link : `https://www.jobberman.com${link}`;

                    // Deduplicate within the same run
                    if (processedUrls.has(fullUrl)) continue;
                    processedUrls.add(fullUrl);

                    // Get title from the link text or nested element
                    let title = await linkElement.textContent();
                    if (!title || title.trim().length === 0) {
                        // Try finding title inside
                        title = await linkElement.$eval("div, span, h3", el => el.textContent).catch(() => "");
                    }

                    if (!title || title.trim().length < 3) continue;

                    // Try to find container to extract other details
                    // This is best-effort since we are iterating links
                    const container = await linkElement.evaluateHandle(el => {
                        return el.closest("article") || el.closest(".job-item") || el.closest(".search-result-card") || el.parentElement;
                    });

                    let company = "Unknown";
                    let location = "Nigeria";
                    let jobType = "full-time";

                    if (container) {
                        // Try to extract details from container
                        // We use evaluate to run code in browser context which is safer for generic selectors
                        const details = await container.evaluate((el: any) => {
                            const text = el.innerText || "";
                            // Simple heuristics
                            const lines = text.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
                            return {
                                text,
                                lines
                            };
                        });

                        // Heuristic: Company is often the second line or contains "Ltd", "Limited", etc.
                        if (details.lines.length > 1) {
                            // This is a rough guess, but better than nothing
                            // In a real scraper we'd be more specific, but the layout keeps changing
                            if (details.lines[1] !== title) company = details.lines[1];
                        }
                    }

                    gigs.push({
                        external_id: this.generateId(fullUrl),
                        source: this.name,
                        title: title?.trim(),
                        company: company,
                        location: location,
                        job_type: this.normalizeJobType(jobType),
                        description: title, // Summary not available without visiting page
                        apply_url: fullUrl,
                        posted_at: new Date().toISOString(),
                        skills: [],
                        category: "General",
                    });
                } catch (error: any) {
                    // logger.debug(`Skipping job element: ${error.message}`);
                }
            }

            logger.info(`✅ Scraped ${gigs.length} jobs from Jobberman`);
        } catch (error: any) {
            logger.error(`❌ Error scraping Jobberman: ${error.message}`);
        } finally {
            await browser.close();
        }

        return gigs;
    }
}
