import { BaseTool } from "./base.tool.js";
export class GetGigPerformanceTool extends BaseTool {
    constructor() {
        super(...arguments);
        this.name = "get_gig_performance_tool";
        this.description = "Get performance metrics for user's gigs/applications.";
    }
    async _call(params) {
        const userId = params.userId || this.userId;
        return this.request(`/api/analytics/gigs?userId=${userId}`, "GET");
    }
}
