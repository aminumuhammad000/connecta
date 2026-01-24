import { BaseTool } from "./base.tool";
export class GetProfileAnalyticsTool extends BaseTool {
    constructor() {
        super(...arguments);
        this.name = "get_profile_analytics_tool";
        this.description = "Get analytics for a user's profile (views, clicks).";
    }
    async _call(params) {
        const userId = params.userId || this.userId;
        return this.request(`/api/analytics/profile?userId=${userId}`, "GET");
    }
}
