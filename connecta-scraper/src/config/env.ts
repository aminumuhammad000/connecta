import dotenv from "dotenv";

dotenv.config();

export const config = {
    connecta: {
        apiUrl: process.env.CONNECTA_API_URL || "http://localhost:5000/api",
        apiKey: process.env.CONNECTA_API_KEY || "",
    },
    scraping: {
        intervalHours: parseInt(process.env.SCRAPE_INTERVAL_HOURS || "24", 10),
        maxRetries: parseInt(process.env.MAX_RETRIES || "3", 10),
        retryDelayMs: parseInt(process.env.RETRY_DELAY_MS || "5000", 10),
    },
    logging: {
        level: process.env.LOG_LEVEL || "info",
    },
};

// Validate configuration
if (!config.connecta.apiKey) {
    console.error("❌ CONNECTA_API_KEY is not set in environment variables");
    process.exit(1);
}
