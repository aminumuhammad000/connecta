import axios from "axios";
import { config } from "../config/env";
import { ExternalGig, ConnectaResponse } from "../types";
import { logger } from "../utils/logger";

export class ConnectaService {
    private baseUrl: string;
    private apiKey: string;

    constructor() {
        this.baseUrl = config.connecta.apiUrl;
        this.apiKey = config.connecta.apiKey;
    }

    /**
     * Create or update an external gig
     */
    async createOrUpdateGig(gig: ExternalGig): Promise<boolean> {
        try {
            const response = await axios.post<ConnectaResponse>(
                `${this.baseUrl}/external-gigs`,
                gig,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-API-Key": this.apiKey,
                    },
                }
            );

            if (response.data.success) {
                logger.info(`✅ Created/Updated gig: ${gig.title} from ${gig.source}`);
                return true;
            }

            logger.warn(`⚠️ Failed to create/update gig: ${response.data.message}`);
            return false;
        } catch (error: any) {
            if (error.response) {
                logger.error(`❌ Error creating/updating gig: ${error.message} - ${JSON.stringify(error.response.data)}`);
            } else {
                logger.error(`❌ Error creating/updating gig: ${error.message}`);
            }
            return false;
        }
    }

    /**
     * Delete an external gig
     */
    async deleteGig(source: string, externalId: string): Promise<boolean> {
        try {
            const response = await axios.delete<ConnectaResponse>(
                `${this.baseUrl}/external-gigs/${source}/${externalId}`,
                {
                    headers: {
                        "X-API-Key": this.apiKey,
                    },
                }
            );

            if (response.data.success) {
                logger.info(`🗑️  Deleted gig: ${externalId} from ${source}`);
                return true;
            }

            return false;
        } catch (error: any) {
            if (error.response?.status === 404) {
                logger.debug(`Gig already deleted: ${externalId}`);
                return true;
            }
            logger.error(`❌ Error deleting gig: ${error.message}`);
            return false;
        }
    }

    /**
     * Get all external gigs from a source (for comparison)
     */
    async getExternalGigs(source: string): Promise<any[]> {
        try {
            const response = await axios.get<ConnectaResponse>(
                `${this.baseUrl}/external-gigs?source=${source}`,
                {
                    headers: {
                        "X-API-Key": this.apiKey,
                    },
                }
            );

            return response.data.data || [];
        } catch (error: any) {
            logger.error(`❌ Error fetching external gigs: ${error.message}`);
            return [];
        }
    }
}
