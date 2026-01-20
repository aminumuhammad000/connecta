"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetGigPerformanceTool = void 0;
const base_tool_1 = require("./base.tool");
class GetGigPerformanceTool extends base_tool_1.BaseTool {
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
exports.GetGigPerformanceTool = GetGigPerformanceTool;
