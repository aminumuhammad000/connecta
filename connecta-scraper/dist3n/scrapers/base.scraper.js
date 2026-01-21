"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseScraper = void 0;
/**
 * Base scraper class that can be extended for specific platforms
 */
class BaseScraper {
    /**
     * Normalize job type string
     */
    normalizeJobType(jobType) {
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
    generateId(url) {
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
    cleanDescription(text, maxLength = 2000) {
        return text
            .replace(/<[^>]*>/g, "") // Strip HTML tags
            .replace(/[ \t]+/g, " ") // Collapse spaces/tabs
            .replace(/\n\s*\n/g, "\n") // Collapse multiple newlines
            .trim()
            .substring(0, maxLength);
    }
}
exports.BaseScraper = BaseScraper;
