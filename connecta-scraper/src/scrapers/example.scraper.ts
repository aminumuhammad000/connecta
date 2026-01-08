import { BaseScraper } from "./base.scraper";
import { ExternalGig } from "../types";
import { chromium } from "playwright";

/**
 * Example scraper template
 * Copy this file and customize for new job platforms
 */
export class ExampleScraper extends BaseScraper {
    name = "example-platform"; // Change to platform name (lowercase, no spaces)
    private baseUrl = "https://example.com/jobs"; // Change to platform URL

    async scrape(): Promise<ExternalGig[]> {
        const gigs: ExternalGig[] = [];

        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();

        try {
            // 1. Navigate to jobs page
            await page.goto(this.baseUrl, { waitUntil: "networkidle" });

            // 2. Wait for job listings to load
            await page.waitForSelector(".job-item-selector"); // Update selector

            // 3. Get all job elements
            const jobElements = await page.$$(".job-item-selector"); // Update selector

            // 4. Extract details from each job
            for (const element of jobElements) {
                try {
                    const title = await element.$eval("h2", (el) => el.textContent?.trim());
                    const company = await element.$eval(".company", (el) => el.textContent?.trim());
                    const location = await element.$eval(".location", (el) => el.textContent?.trim());
                    const jobType = await element.$eval(".job-type", (el) => el.textContent?.trim());
                    const link = await element.$eval("a", (el) => el.getAttribute("href"));

                    if (!title || !link) continue;

                    const fullUrl = link.startsWith("http") ? link : `https://example.com${link}`;

                    gigs.push({
                        external_id: this.generateId(fullUrl),
                        source: this.name,
                        title: title || "Untitled",
                        company: company || "Unknown",
                        location: location || "Nigeria",
                        job_type: this.normalizeJobType(jobType || "full-time"),
                        description: title || "",
                        apply_url: fullUrl,
                        posted_at: new Date().toISOString(),
                        skills: [],
                        category: "General",
                    });
                } catch (error) {
                    // Skip invalid job listings
                    continue;
                }
            }
        } finally {
            await browser.close();
        }

        return gigs;
    }
}
