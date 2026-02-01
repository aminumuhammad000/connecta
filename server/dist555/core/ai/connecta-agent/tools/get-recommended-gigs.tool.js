import { BaseTool } from "./base.tool.js";
export class GetRecommendedGigsTool extends BaseTool {
    constructor() {
        super(...arguments);
        this.name = "get_recommended_gigs_tool";
        this.description = "AI-driven gig recommendations beyond simple skill match.";
    }
    async _call(params) {
        // Using unified jobs router
        return this.request(`/api/jobs/recommended`, "GET");
    }
}
