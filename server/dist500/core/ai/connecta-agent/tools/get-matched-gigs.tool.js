import { BaseTool } from "./base.tool.js";
export class GetMatchedGigsTool extends BaseTool {
    constructor() {
        super(...arguments);
        this.name = "get_matched_gigs_tool";
        this.description = "Get gigs that match the user's skills and preferences.";
    }
    async _call(params) {
        // Use the existing 'recommended' endpoint under /api/jobs
        const query = params.query || {};
        return this.request(`/api/jobs/recommended`, "GET", undefined, query);
    }
}
