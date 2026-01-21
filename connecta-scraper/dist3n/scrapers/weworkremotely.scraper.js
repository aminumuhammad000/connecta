"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeWorkRemotelyScraper = void 0;
const base_scraper_1 = require("./base.scraper");
const playwright_1 = require("playwright");
const logger_1 = require("../utils/logger");
class WeWorkRemotelyScraper extends base_scraper_1.BaseScraper {
    constructor() {
        super(...arguments);
        this.name = "weworkremotely";
        this.baseUrl = "https://weworkremotely.com/";
    }
    async scrape() {
        const gigs = [];
        const browser = await playwright_1.chromium.launch({ headless: true });
        const page = await browser.newPage();
        try {
            logger_1.logger.info(`🌐 Loading WeWorkRemotely jobs page...`);
            // Use domcontentloaded for faster load, networkidle can be flaky on some sites
            await page.goto(this.baseUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
            // Wait for job listings
            await page.waitForSelector(".jobs article li", { timeout: 15000 }).catch(() => {
                logger_1.logger.warn("⚠️ Job listings selector not found");
            });
            // Select job items
            const jobElements = await page.$$(".jobs article li");
            logger_1.logger.info(`📋 Found ${jobElements.length} potential job listings`);
            for (const element of jobElements) {
                try {
                    // Skip "view all" links
                    const isViewAll = await element.$(".view-all");
                    if (isViewAll)
                        continue;
                    // Extract details
                    const titleElement = await element.$(".title");
                    const companyElement = await element.$(".company");
                    const regionElement = await element.$(".region");
                    if (!titleElement || !companyElement)
                        continue;
                    const title = await titleElement.textContent();
                    const company = await companyElement.textContent();
                    const region = regionElement ? await regionElement.textContent() : "Remote";
                    // Find the link
                    // Structure: <li class="feature"><a href="...">...</a></li>
                    // The 'a' tag wraps the content or is inside
                    const anchor = await element.$("a");
                    const link = await anchor?.getAttribute("href");
                    if (!title || !link)
                        continue;
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
                }
                catch (error) {
                    // logger.debug(`Skipping job element: ${error.message}`);
                }
            }
            logger_1.logger.info(`✅ Scraped ${gigs.length} jobs from WeWorkRemotely`);
        }
        catch (error) {
            logger_1.logger.error(`❌ Error scraping WeWorkRemotely: ${error.message}`);
        }
        finally {
            await browser.close();
        }
        return gigs;
    }
}
exports.WeWorkRemotelyScraper = WeWorkRemotelyScraper;
