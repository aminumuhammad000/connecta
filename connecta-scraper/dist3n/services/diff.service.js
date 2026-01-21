"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiffService = void 0;
const logger_1 = require("../utils/logger");
class DiffService {
    /**
     * Compare current scraped gigs with previously scraped gigs
     * Returns gigs to create/update and gigs to delete
     */
    compare(currentGigs, previousGigs) {
        const toCreateOrUpdate = [];
        const toDelete = [];
        // Map previous gigs by externalId for quick lookup
        const previousGigMap = new Map();
        for (const gig of previousGigs) {
            if (gig.externalId) {
                previousGigMap.set(gig.externalId, gig);
            }
        }
        // Map current gigs by external_id
        const currentGigMap = new Map();
        for (const gig of currentGigs) {
            currentGigMap.set(gig.external_id, gig);
            toCreateOrUpdate.push(gig); // All current gigs should be created/updated
        }
        // Find gigs to delete (in previous but not in current)
        for (const [externalId, previousGig] of previousGigMap.entries()) {
            if (!currentGigMap.has(externalId)) {
                toDelete.push({
                    source: previousGig.source,
                    externalId: externalId,
                });
            }
        }
        logger_1.logger.info(`📊 Diff result: ${toCreateOrUpdate.length} to create/update, ${toDelete.length} to delete`);
        return { toCreateOrUpdate, toDelete };
    }
}
exports.DiffService = DiffService;
