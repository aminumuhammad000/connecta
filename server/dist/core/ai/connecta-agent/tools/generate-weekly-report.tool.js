"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateWeeklyReportTool = void 0;
const base_tool_1 = require("./base.tool");
class GenerateWeeklyReportTool extends base_tool_1.BaseTool {
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
exports.GenerateWeeklyReportTool = GenerateWeeklyReportTool;
