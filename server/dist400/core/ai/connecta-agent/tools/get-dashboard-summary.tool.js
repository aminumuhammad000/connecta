import { BaseTool } from "./base.tool.js";
export class GetDashboardSummaryTool extends BaseTool {
    constructor() {
        super(...arguments);
        this.name = "get_dashboard_summary_tool";
        this.description = "Fetch overview summary for user dashboard.";
    }
    async _call(params) {
        return this.request(`/api/dashboard/stats`, "GET");
    }
}
