import { BaseTool } from "./base.tool.js";

export class GetDashboardSummaryTool extends BaseTool {
  name = "get_dashboard_summary_tool";
  description = "Fetch overview summary for user dashboard.";

  async _call(params: Record<string, any>) {
    return this.request(`/api/dashboard/stats`, "GET");
  }
}
