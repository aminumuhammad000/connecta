// Type definitions for the scraper service

export interface ExternalGig {
    external_id: string;
    source: string;
    title: string;
    company: string;
    location: string;
    locationType?: "remote" | "onsite" | "hybrid";
    job_type: "full-time" | "part-time" | "contract" | "freelance" | "one-time" | "monthly" | "permanent" | "adhoc";
    jobScope?: "local" | "international";
    description: string;
    apply_url: string;
    posted_at: string;
    skills?: string[];
    category: string; // Required: Technology & Programming, Design & Creative, etc.
    niche?: string; // Optional: Specific subcategory like "Web Development", "UI/UX Design"
    experience?: string; // e.g., "Intermediate", "Senior", "Entry Level"
    deadline?: string; // ISO date string
    duration?: string; // e.g., "3", "6"
    durationType?: "days" | "weeks" | "months" | "years";
    budget?: string; // Optional budget information

    // Metadata for tracking
    lastScrapedAt?: string; // ISO date string - when this job was last seen by the scraper
    firstScrapedAt?: string; // ISO date string - when this job was first discovered
}

export interface ScraperResult {
    source: string;
    gigs: ExternalGig[];
    errors?: string[];
}

export interface IScraper {
    name: string;
    scrape(): Promise<ExternalGig[]>;
}

export interface ConnectaResponse {
    success: boolean;
    message?: string;
    data?: any;
}
