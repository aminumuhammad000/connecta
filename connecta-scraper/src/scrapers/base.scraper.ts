import { IScraper, ExternalGig } from "../types";

/**
 * Base scraper class that can be extended for specific platforms
 */
export abstract class BaseScraper implements IScraper {
    abstract name: string;
    abstract scrape(): Promise<ExternalGig[]>;

    /**
     * Normalize job type string
     */
    protected normalizeJobType(jobType: string): "full-time" | "part-time" | "contract" | "freelance" {
        const normalized = jobType.toLowerCase();

        if (normalized.includes("full") || normalized.includes("fulltime")) {
            return "full-time";
        }
        if (normalized.includes("part") || normalized.includes("parttime")) {
            return "part-time";
        }
        if (normalized.includes("contract")) {
            return "contract";
        }
        if (normalized.includes("freelance") || normalized.includes("gig")) {
            return "freelance";
        }

        return "full-time"; // default
    }

    /**
     * Generate a stable ID from URL or title
     */
    protected generateId(url: string): string {
        // Extract ID from URL or create hash
        const match = url.match(/\/(\d+)\/?$/);
        if (match) {
            return match[1];
        }

        // Fallback: use last part of URL
        return url.split("/").filter(Boolean).pop() || url;
    }

    /**
     * Clean and truncate description
     */
    protected cleanDescription(text: string, maxLength: number = 2000): string {
        return text
            .replace(/<[^>]*>/g, "") // Strip HTML tags
            .replace(/[ \t]+/g, " ") // Collapse spaces/tabs
            .replace(/\n\s*\n/g, "\n") // Collapse multiple newlines
            .trim()
            .substring(0, maxLength);
    }
}
