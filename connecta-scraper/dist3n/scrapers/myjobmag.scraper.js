"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyJobMagScraper = void 0;
const base_scraper_1 = require("./base.scraper");
const playwright_1 = require("playwright");
const logger_1 = require("../utils/logger");
class MyJobMagScraper extends base_scraper_1.BaseScraper {
    constructor() {
        super(...arguments);
        this.name = "myjobmag";
        this.baseUrl = "https://www.myjobmag.com/";
    }
    async scrape() {
        const gigs = [];
        const browser = await playwright_1.chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();
        try {
            logger_1.logger.info(`🌐 Loading MyJobMag jobs page...`);
            await page.goto(this.baseUrl, { waitUntil: "networkidle" });
            // Wait for job listings
            await page.waitForSelector(".job-list-li, .job-info", { timeout: 10000 }).catch(() => {
                logger_1.logger.warn("⚠️ Job listings selector not found");
            });
            // Get all job links first
            const jobLinks = await page.$$eval("li.job-list-li h2 a", (elements) => elements.map(el => el.getAttribute("href")).filter(href => href !== null));
            logger_1.logger.info(`📋 Found ${jobLinks.length} potential job listings. Visiting details pages...`);
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
                        .catch(() => page.$eval(".job-key-info", el => el.textContent?.split("-")[0]?.trim())
                        .catch(() => "Unknown"));
                    // Extract Location
                    const location = await page.$eval(".job-key-info span", el => el.textContent?.trim()).catch(() => "Nigeria");
                    // Extract Description
                    const description = await page.$eval(".job-details", (el) => el.innerText).catch(() => title);
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
                    let deadline;
                    if (deadlineText) {
                        // Try to parse date. Format usually "Jan 01, 2026"
                        const parsedDate = new Date(deadlineText);
                        if (!isNaN(parsedDate.getTime())) {
                            deadline = parsedDate.toISOString();
                            // Check if expired
                            if (parsedDate < new Date()) {
                                logger_1.logger.info(`⚠️ Skipping expired job: ${title} (Deadline: ${deadlineText})`);
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
                }
                catch (error) {
                    logger_1.logger.error(`❌ Error scraping job details: ${error.message}`);
                }
            }
            logger_1.logger.info(`✅ Scraped ${gigs.length} active jobs from MyJobMag`);
        }
        catch (error) {
            logger_1.logger.error(`❌ Error scraping MyJobMag: ${error.message}`);
        }
        finally {
            await browser.close();
        }
        return gigs;
    }
}
exports.MyJobMagScraper = MyJobMagScraper;
