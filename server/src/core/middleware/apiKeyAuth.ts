import { Request, Response, NextFunction } from "express";

/**
 * Middleware to validate API key for external services
 */
export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers["x-api-key"] || req.headers["authorization"]?.replace("Bearer ", "");

    if (!apiKey) {
        return res.status(401).json({
            success: false,
            message: "API key required",
        });
    }

    // Validate API key
    const validApiKey = process.env.SCRAPER_API_KEY;

    if (!validApiKey) {
        console.error("SCRAPER_API_KEY not set in environment variables");
        return res.status(500).json({
            success: false,
            message: "Server configuration error",
        });
    }

    if (apiKey !== validApiKey) {
        return res.status(403).json({
            success: false,
            message: "Invalid API key",
        });
    }

    next();
};
