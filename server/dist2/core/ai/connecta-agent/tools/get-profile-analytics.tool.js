"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProfileAnalyticsTool = void 0;
const base_tool_1 = require("./base.tool");
class GetProfileAnalyticsTool extends base_tool_1.BaseTool {
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
exports.GetProfileAnalyticsTool = GetProfileAnalyticsTool;
