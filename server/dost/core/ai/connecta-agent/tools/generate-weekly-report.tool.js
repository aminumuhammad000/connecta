import { BaseTool } from "./base.tool";
export class GenerateWeeklyReportTool extends BaseTool {
    constructor() {
        super(...arguments);
        this.name = "generate_weekly_report_tool";
        this.description = "Generate a weekly report for the user (views, apps, earnings).";
    }
    async _call(params) {
        const userId = params.userId || this.userId;
        return this.request(`/api/analytics/reports/weekly?userId=${userId}`, "GET");
    }
}
