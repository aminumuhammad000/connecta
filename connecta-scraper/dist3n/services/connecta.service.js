"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectaService = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
class ConnectaService {
    constructor() {
        this.baseUrl = env_1.config.connecta.apiUrl;
        this.apiKey = env_1.config.connecta.apiKey;
    }
    /**
     * Create or update an external gig
     */
    async createOrUpdateGig(gig) {
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/external-gigs`, gig, {
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": this.apiKey,
                },
            });
            if (response.data.success) {
                logger_1.logger.info(`✅ Created/Updated gig: ${gig.title} from ${gig.source}`);
                return true;
            }
            logger_1.logger.warn(`⚠️ Failed to create/update gig: ${response.data.message}`);
            return false;
        }
        catch (error) {
            if (error.response) {
                logger_1.logger.error(`❌ Error creating/updating gig: ${error.message} - ${JSON.stringify(error.response.data)}`);
            }
            else {
                logger_1.logger.error(`❌ Error creating/updating gig: ${error.message}`);
            }
            return false;
        }
    }
    /**
     * Delete an external gig
     */
    async deleteGig(source, externalId) {
        try {
            const response = await axios_1.default.delete(`${this.baseUrl}/external-gigs/${source}/${externalId}`, {
                headers: {
                    "X-API-Key": this.apiKey,
                },
            });
            if (response.data.success) {
                logger_1.logger.info(`🗑️  Deleted gig: ${externalId} from ${source}`);
                return true;
            }
            return false;
        }
        catch (error) {
            if (error.response?.status === 404) {
                logger_1.logger.debug(`Gig already deleted: ${externalId}`);
                return true;
            }
            logger_1.logger.error(`❌ Error deleting gig: ${error.message}`);
            return false;
        }
    }
    /**
     * Get all external gigs from a source (for comparison)
     */
    async getExternalGigs(source) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/external-gigs?source=${source}`, {
                headers: {
                    "X-API-Key": this.apiKey,
                },
            });
            return response.data.data || [];
        }
        catch (error) {
            logger_1.logger.error(`❌ Error fetching external gigs: ${error.message}`);
            return [];
        }
    }
}
exports.ConnectaService = ConnectaService;
