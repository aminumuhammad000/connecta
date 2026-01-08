import { BaseScraper } from "./base.scraper";
import { ExternalGig } from "../types";
import { chromium } from "playwright";
import { logger } from "../utils/logger";

export class MyJobMagScraper extends BaseScraper {
    name = "myjobmag";
    private baseUrl = "https://www.myjobmag.com/";

    async scrape(): Promise<ExternalGig[]> {
        const gigs: ExternalGig[] = [];
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();

        try {
            logger.info(`🌐 Loading MyJobMag jobs page...`);
            await page.goto(this.baseUrl, { waitUntil: "networkidle" });

            // Wait for job listings
            await page.waitForSelector(".job-list-li, .job-info", { timeout: 10000 }).catch(() => {
                logger.warn("⚠️ Job listings selector not found");
            });

            // Select job items
            const jobElements = await page.$$("li.job-list-li");

            logger.info(`📋 Found ${jobElements.length} potential job listings`);

            for (const element of jobElements) {
                try {
                    // Extract details
                    const titleElement = await element.$("h2 a");
                    if (!titleElement) continue;

                    const title = await titleElement.textContent();
                    const link = await titleElement.getAttribute("href");

                    if (!title || !link) continue;

                    const fullUrl = link.startsWith("http") ? link : `https://www.myjobmag.com${link}`;

                    // Company often in a separate element or part of text
                    // Structure varies, usually: <h2>...</h2> ... <li class="job-company">Company</li>
                    const company = await element.$eval(".job-company", el => el.textContent?.trim()).catch(() => "Unknown");

                    // Location
                    // Often in <li class="job-location">...</li>
                    const location = await element.$eval(".job-location", el => el.textContent?.trim()).catch(() => "Nigeria");

                    // Description/Summary
                    const description = await element.$eval(".job-desc", el => el.textContent?.trim()).catch(() => title);

                    gigs.push({
                        external_id: this.generateId(fullUrl),
                        source: this.name,
                        title: title?.trim() || "Untitled",
                        company: company || "Unknown",
                        location: location || "Nigeria",
                        job_type: "full-time", // Default, as it's not always clear on list page
                        description: this.cleanDescription(description || title),
                        apply_url: fullUrl,
                        posted_at: new Date().toISOString(),
                        skills: [], // Hard to extract from list view
                        category: "General",
                    });

                } catch (error: any) {
                    // logger.debug(`Skipping job element: ${error.message}`);
                }
            }

            logger.info(`✅ Scraped ${gigs.length} jobs from MyJobMag`);

        } catch (error: any) {
            logger.error(`❌ Error scraping MyJobMag: ${error.message}`);
        } finally {
            await browser.close();
        }

        return gigs;
    }
}
