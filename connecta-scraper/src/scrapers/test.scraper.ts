import { BaseScraper } from "./base.scraper";
import { ExternalGig } from "../types";
import { logger } from "../utils/logger";

/**
 * Test scraper - generates mock data for testing
 * Use this to verify the scraper service works end-to-end
 */
export class TestScraper extends BaseScraper {
    name = "test-platform";

    async scrape(): Promise<ExternalGig[]> {
        logger.info("🧪 Running test scraper with mock data...");

        // Generate some mock job listings
        const mockGigs: ExternalGig[] = [
            {
                external_id: "test-001",
                source: this.name,
                title: "Senior React Developer",
                company: "Tech Innovators Ltd",
                location: "Lagos, Nigeria",
                job_type: "full-time",
                description: "We are seeking an experienced React developer to join our dynamic team.",
                apply_url: "https://example.com/jobs/test-001",
                posted_at: new Date().toISOString(),
                skills: ["React", "TypeScript", "Node.js"],
                category: "Web Development",
            },
            {
                external_id: "test-002",
                source: this.name,
                title: "Backend Engineer (Node.js)",
                company: "StartupHub Nigeria",
                location: "Remote",
                job_type: "contract",
                description: "Looking for a skilled Node.js developer for a 6-month contract.",
                apply_url: "https://example.com/jobs/test-002",
                posted_at: new Date().toISOString(),
                skills: ["Node.js", "Express", "MongoDB"],
                category: "Backend Development",
            },
            {
                external_id: "test-003",
                source: this.name,
                title: "UI/UX Designer",
                company: "Creative Solutions",
                location: "Abuja, Nigeria",
                job_type: "part-time",
                description: "Seeking a creative UI/UX designer for part-time work.",
                apply_url: "https://example.com/jobs/test-003",
                posted_at: new Date().toISOString(),
                skills: ["Figma", "Adobe XD", "UI Design"],
                category: "Design",
            },
        ];

        logger.info(`✅ Generated ${mockGigs.length} test jobs`);
        return mockGigs;
    }
}
