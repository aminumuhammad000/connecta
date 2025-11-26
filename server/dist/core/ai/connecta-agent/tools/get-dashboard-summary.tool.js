"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDashboardSummaryTool = void 0;
const base_tool_1 = require("./base.tool");
class GetDashboardSummaryTool extends base_tool_1.BaseTool {
    constructor() {
        super(...arguments);
        this.name = "get_dashboard_summary_tool";
        this.description = "Fetch overview summary for user dashboard.";
    }
    async _call(params) {
        return this.request(`/api/dashboard/stats`, "GET");
    }
}
exports.GetDashboardSummaryTool = GetDashboardSummaryTool;
