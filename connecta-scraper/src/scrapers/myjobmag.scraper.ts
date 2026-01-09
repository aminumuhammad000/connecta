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
        const context = await browser.newContext();
        const page = await context.newPage();

        try {
            logger.info(`🌐 Loading MyJobMag jobs page...`);
            await page.goto(this.baseUrl, { waitUntil: "networkidle" });

            // Wait for job listings
            await page.waitForSelector(".job-list-li, .job-info", { timeout: 10000 }).catch(() => {
                logger.warn("⚠️ Job listings selector not found");
            });

            // Get all job links first
            const jobLinks = await page.$$eval("li.job-list-li h2 a", (elements) =>
                elements.map(el => el.getAttribute("href")).filter(href => href !== null) as string[]
            );

            logger.info(`📋 Found ${jobLinks.length} potential job listings. Visiting details pages...`);

            // Limit to first 20 to avoid timeouts/blocking for now, or scrape all if robust
            // For now, let's try to scrape all but sequentially
            for (const link of jobLinks) {
                try {
                    const fullUrl = link.startsWith("http") ? link : `https://www.myjobmag.com${link}`;

                    // Navigate to details page
                    await page.goto(fullUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

                    const title = await page.$eval("h1", el => el.textContent?.trim()).catch(() => "Untitled");

                    // Extract Company
                    const company = await page.$eval(".job-key-info a[href*='/jobs-at/']", el => el.textContent?.trim())
                        .catch(() =>
                            page.$eval(".job-key-info", el => el.textContent?.split("-")[0]?.trim())
                                .catch(() => "Unknown")
                        );

                    // Extract Location
                    const location = await page.$eval(".job-key-info span", el => el.textContent?.trim()).catch(() => "Nigeria");

                    // Extract Description
                    const description = await page.$eval(".job-details", el => el.innerHTML).catch(() => title);

                    // Extract Deadline
                    // Look for "Deadline" or "Application Deadline"
                    const deadlineText = await page.evaluate(() => {
                        // @ts-ignore
                        const items = Array.from(document.querySelectorAll('li, p, span, div'));
                        for (const item of items) {
                            // @ts-ignore
                            const text = item.textContent || "";
                            if (text.includes("Deadline:") || text.includes("Application Deadline:")) {
                                return text.replace(/.*Deadline:/i, "").trim();
                            }
                        }
                        return null;
                    });

                    // Parse deadline and check if expired
                    let deadline: string | undefined;
                    if (deadlineText) {
                        // Try to parse date. Format usually "Jan 01, 2026"
                        const parsedDate = new Date(deadlineText);
                        if (!isNaN(parsedDate.getTime())) {
                            deadline = parsedDate.toISOString();

                            // Check if expired
                            if (parsedDate < new Date()) {
                                logger.info(`⚠️ Skipping expired job: ${title} (Deadline: ${deadlineText})`);
                                continue;
                            }
                        }
                    }

                    // If no deadline found, set default to 2 weeks from now
                    if (!deadline) {
                        const twoWeeksFromNow = new Date();
                        twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
                        deadline = twoWeeksFromNow.toISOString();
                    }

                    gigs.push({
                        external_id: this.generateId(fullUrl),
                        source: this.name,
                        title: title || "Untitled",
                        company: company || "Unknown",
                        location: location || "Nigeria",
                        job_type: "full-time",
                        description: this.cleanDescription(description || title), // Clean HTML tags if needed, or keep HTML
                        apply_url: fullUrl,
                        posted_at: new Date().toISOString(), // We could also extract posted date
                        skills: [],
                        category: "General",
                        deadline: deadline
                    });

                    // Small delay to be polite
                    await page.waitForTimeout(500);

                } catch (error: any) {
                    logger.error(`❌ Error scraping job details: ${error.message}`);
                }
            }

            logger.info(`✅ Scraped ${gigs.length} active jobs from MyJobMag`);

        } catch (error: any) {
            logger.error(`❌ Error scraping MyJobMag: ${error.message}`);
        } finally {
            await browser.close();
        }

        return gigs;
    }
}
