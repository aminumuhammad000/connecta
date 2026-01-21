"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobbermanScraper = void 0;
const playwright_1 = require("playwright");
const base_scraper_1 = require("./base.scraper");
const logger_1 = require("../utils/logger");
/**
 * Jobberman scraper
 * Scrapes job listings from Jobberman Nigeria
 */
class JobbermanScraper extends base_scraper_1.BaseScraper {
    constructor() {
        super(...arguments);
        this.name = "jobberman";
        this.baseUrl = "https://www.jobberman.com/jobs";
    }
    async scrape() {
        const gigs = [];
        const browser = await playwright_1.chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();
        try {
            logger_1.logger.info(`🌐 Loading Jobberman jobs page...`);
            await page.goto(this.baseUrl, { waitUntil: "networkidle" });
            // Wait for job listings
            await page.waitForSelector("a[href*='/listings/']", { timeout: 10000 }).catch(() => {
                logger_1.logger.warn("⚠️ Job listings not found, trying alternative selector");
            });
            // Get all job links first
            const jobLinks = await page.$$eval("a[href*='/listings/']", (elements) => elements.map(el => el.getAttribute("href")).filter(href => href !== null));
            // Deduplicate
            const uniqueLinks = Array.from(new Set(jobLinks));
            logger_1.logger.info(`📋 Found ${uniqueLinks.length} potential job listings. Visiting details pages...`);
            for (const link of uniqueLinks) {
                try {
                    const fullUrl = link.startsWith("http") ? link : `https://www.jobberman.com${link}`;
                    // Navigate to details page
                    await page.goto(fullUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
                    const title = await page.$eval("h1", el => el.textContent?.trim()).catch(() => "Untitled");
                    // Extract Company
                    const company = await page.$eval(".job-header-company", el => el.textContent?.trim()).catch(() => "Unknown");
                    // Extract Location
                    const location = await page.$eval(".job-header-location", el => el.textContent?.trim()).catch(() => "Nigeria");
                    // Extract Description
                    const description = await page.$eval(".job-details-content", (el) => el.innerText).catch(() => title);
                    // Extract Deadline
                    const deadlineText = await page.evaluate(() => {
                        // @ts-ignore
                        const elements = Array.from(document.querySelectorAll('li, p, span, div, h3, h4'));
                        // @ts-ignore
                        const deadlineEl = elements.find(el => el.textContent?.includes('Deadline') || el.textContent?.includes('Application Deadline'));
                        if (deadlineEl) {
                            // Clean up text: "Application Deadline: 20 Jan 2026" -> "20 Jan 2026"
                            // @ts-ignore
                            return deadlineEl.textContent?.replace(/.*Deadline:?/i, '').trim();
                        }
                        return null;
                    });
                    let deadline;
                    if (deadlineText) {
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
                        locationType: location?.toLowerCase().includes("remote") ? "remote" : "onsite",
                        job_type: "full-time", // Default, will be categorized later
                        jobScope: location?.toLowerCase().includes("nigeria") || location?.toLowerCase().includes("lagos") ? "local" : "international",
                        description: this.cleanDescription(description || title),
                        apply_url: fullUrl,
                        posted_at: new Date().toISOString(),
                        skills: [], // Could be extracted from description in future
                        category: "Other", // Will be auto-categorized by CategoryClassifierService
                        niche: undefined, // Will be auto-categorized by CategoryClassifierService
                        experience: "Any", // Default - could be extracted from description
                        deadline: deadline,
                        duration: undefined, // Not available from Jobberman
                        durationType: "months",
                        budget: undefined, // Not available from Jobberman
                    });
                    await page.waitForTimeout(500);
                }
                catch (error) {
                    logger_1.logger.error(`❌ Error scraping job details: ${error.message}`);
                }
            }
            logger_1.logger.info(`✅ Scraped ${gigs.length} active jobs from Jobberman`);
        }
        catch (error) {
            logger_1.logger.error(`❌ Error scraping Jobberman: ${error.message}`);
        }
        finally {
            await browser.close();
        }
        return gigs;
    }
}
exports.JobbermanScraper = JobbermanScraper;
