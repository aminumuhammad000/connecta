import axios from "axios";
import { config } from "../config/env";
import { logger } from "../utils/logger";

/**
 * Cleanup Service for External Gigs
 * Implements the 14-day deletion policy
 */
export class CleanupService {
    /**
     * Delete external gigs that haven't been seen in 14 days
     * This runs as a separate task, typically daily
     */
    async cleanupStaleExternalGigs(): Promise<void> {
        try {
            logger.info("🧹 Starting cleanup of stale external gigs...");

            const fourteenDaysAgo = new Date();
            fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

            // Find all external gigs that haven't been scraped in 14 days
            // Note: We're using the database query approach instead of API
            // This assumes we have access to the database

            const apiUrl = config.connecta.apiUrl;
            const apiKey = config.connecta.apiKey;

            // Get all external gigs via API
            const response = await axios.get(`${apiUrl}/external-gigs?limit=10000`, {
                headers: {
                    "X-API-Key": apiKey,
                },
            });

            const allExternalGigs = response.data.data || [];

            let deletedCount = 0;
            const gigsToDelete: any[] = [];

            for (const gig of allExternalGigs) {
                // Check if lastScrapedAt exists and is older than 14 days
                if (gig.lastScrapedAt) {
                    const lastSeen = new Date(gig.lastScrapedAt);
                    if (lastSeen < fourteenDaysAgo) {
                        gigsToDelete.push(gig);
                    }
                }
            }

            logger.info(`📋 Found ${gigsToDelete.length} external gigs to delete (not seen in 14 days)`);

            // Delete each stale gig
            for (const gig of gigsToDelete) {
                try {
                    await axios.delete(
                        `${apiUrl}/external-gigs/${gig.source}/${gig.externalId}`,
                        {
                            headers: {
                                "X-API-Key": apiKey,
                            },
                        }
                    );
                    deletedCount++;
                    logger.debug(`🗑️  Deleted stale gig: ${gig.title} (last seen: ${gig.lastScrapedAt})`);
                } catch (error: any) {
                    logger.error(`❌ Failed to delete gig ${gig.externalId}: ${error.message}`);
                }
            }

            logger.info(`✅ Cleanup complete. Deleted ${deletedCount} stale external gigs.`);

            // Log summary
            if (deletedCount > 0) {
                logger.info(`📊 Cleanup Summary: ${deletedCount}/${gigsToDelete.length} gigs deleted successfully`);
            }

        } catch (error: any) {
            logger.error(`❌ Error during cleanup: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get statistics about external gigs
     */
    async getExternalGigStats(): Promise<{
        total: number;
        recentlyActive: number; // Seen in last 7 days
        stale: number; // Not seen in 14+ days
    }> {
        try {
            const apiUrl = config.connecta.apiUrl;
            const apiKey = config.connecta.apiKey;

            const response = await axios.get(`${apiUrl}/external-gigs?limit=10000`, {
                headers: {
                    "X-API-Key": apiKey,
                },
            });

            const allExternalGigs = response.data.data || [];

            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const fourteenDaysAgo = new Date();
            fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

            let recentlyActive = 0;
            let stale = 0;

            for (const gig of allExternalGigs) {
                if (gig.lastScrapedAt) {
                    const lastSeen = new Date(gig.lastScrapedAt);

                    if (lastSeen >= sevenDaysAgo) {
                        recentlyActive++;
                    } else if (lastSeen < fourteenDaysAgo) {
                        stale++;
                    }
                }
            }

            return {
                total: allExternalGigs.length,
                recentlyActive,
                stale,
            };
        } catch (error: any) {
            logger.error(`❌ Error getting stats: ${error.message}`);
            return { total: 0, recentlyActive: 0, stale: 0 };
        }
    }
}
