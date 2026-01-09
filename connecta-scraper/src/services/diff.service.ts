import { ExternalGig } from "../types";
import { logger } from "../utils/logger";

export class DiffService {
    /**
     * Compare current scraped gigs with previously scraped gigs
     * Returns gigs to create/update and gigs to delete
     */
    compare(
        currentGigs: ExternalGig[],
        previousGigs: any[]
    ): {
        toCreateOrUpdate: ExternalGig[];
        toDelete: Array<{ source: string; externalId: string }>;
    } {
        const toCreateOrUpdate: ExternalGig[] = [];
        const toDelete: Array<{ source: string; externalId: string }> = [];

        // Map previous gigs by externalId for quick lookup
        const previousGigMap = new Map<string, any>();
        for (const gig of previousGigs) {
            if (gig.externalId) {
                previousGigMap.set(gig.externalId, gig);
            }
        }

        // Map current gigs by external_id
        const currentGigMap = new Map<string, ExternalGig>();
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

        logger.info(
            `📊 Diff result: ${toCreateOrUpdate.length} to create/update, ${toDelete.length} to delete`
        );

        return { toCreateOrUpdate, toDelete };
    }
}
