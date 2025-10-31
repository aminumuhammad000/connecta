import { BaseTool } from "./base.tool";

export class GenerateWeeklyReportTool extends BaseTool {
  name = "generate_weekly_report_tool";
  description = "Generate a weekly report for the user (views, apps, earnings).";

  async _call(params: Record<string, any>) {
    const userId = params.userId || this.userId;
    return this.request(`/api/analytics/reports/weekly?userId=${userId}`, "GET");
  }
}
