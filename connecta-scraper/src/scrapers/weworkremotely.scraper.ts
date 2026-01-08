import { BaseScraper } from "./base.scraper";
import { ExternalGig } from "../types";
import { chromium } from "playwright";
import { logger } from "../utils/logger";

export class WeWorkRemotelyScraper extends BaseScraper {
    name = "weworkremotely";
    private baseUrl = "https://weworkremotely.com/";

    async scrape(): Promise<ExternalGig[]> {
        const gigs: ExternalGig[] = [];
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();

        try {
            logger.info(`🌐 Loading WeWorkRemotely jobs page...`);
            // Use domcontentloaded for faster load, networkidle can be flaky on some sites
            await page.goto(this.baseUrl, { waitUntil: "domcontentloaded", timeout: 60000 });

            // Wait for job listings
            await page.waitForSelector(".jobs article li", { timeout: 15000 }).catch(() => {
                logger.warn("⚠️ Job listings selector not found");
            });

            // Select job items
            const jobElements = await page.$$(".jobs article li");

            logger.info(`📋 Found ${jobElements.length} potential job listings`);

            for (const element of jobElements) {
                try {
                    // Skip "view all" links
                    const isViewAll = await element.$(".view-all");
                    if (isViewAll) continue;

                    // Extract details
                    const titleElement = await element.$(".title");
                    const companyElement = await element.$(".company");
                    const regionElement = await element.$(".region");

                    if (!titleElement || !companyElement) continue;

                    const title = await titleElement.textContent();
                    const company = await companyElement.textContent();
                    const region = regionElement ? await regionElement.textContent() : "Remote";

                    // Find the link
                    // Structure: <li class="feature"><a href="...">...</a></li>
                    // The 'a' tag wraps the content or is inside
                    const anchor = await element.$("a");
                    const link = await anchor?.getAttribute("href");

                    if (!title || !link) continue;

                    const fullUrl = link.startsWith("http") ? link : `https://weworkremotely.com${link}`;

                    // Default deadline to 2 weeks from now
                    const twoWeeksFromNow = new Date();
                    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
                    const deadline = twoWeeksFromNow.toISOString();

                    gigs.push({
                        external_id: this.generateId(fullUrl),
                        source: this.name,
                        title: title?.trim() || "Untitled",
                        company: company?.trim() || "Unknown",
                        location: region?.trim() || "Remote",
                        job_type: "contract", // WWR is mostly contract/freelance friendly
                        description: title,
                        apply_url: fullUrl,
                        posted_at: new Date().toISOString(),
                        skills: [],
                        category: "Remote",
                        deadline: deadline
                    });

                } catch (error: any) {
                    // logger.debug(`Skipping job element: ${error.message}`);
                }
            }

            logger.info(`✅ Scraped ${gigs.length} jobs from WeWorkRemotely`);

        } catch (error: any) {
            logger.error(`❌ Error scraping WeWorkRemotely: ${error.message}`);
        } finally {
            await browser.close();
        }

        return gigs;
    }
}
