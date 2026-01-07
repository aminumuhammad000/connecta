"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRecommendedGigsTool = void 0;
const base_tool_1 = require("./base.tool");
class GetRecommendedGigsTool extends base_tool_1.BaseTool {
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
exports.GetRecommendedGigsTool = GetRecommendedGigsTool;
