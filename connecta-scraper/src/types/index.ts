// Type definitions for the scraper service

export interface ExternalGig {
    external_id: string;
    source: string;
    title: string;
    company: string;
    location: string;
    job_type: "full-time" | "part-time" | "contract" | "freelance";
    description: string;
    apply_url: string;
    posted_at: string;
    skills?: string[];
    category?: string;
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
