"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadPortfolioTool = void 0;
const base_tool_1 = require("./base.tool");
class UploadPortfolioTool extends base_tool_1.BaseTool {
    constructor() {
        super(...arguments);
        this.name = "upload_portfolio_tool";
        this.description = "Upload or link a new portfolio project.";
    }
    async _call(params) {
        // params expected: { userId?, title, description, url, files? }
        return this.request(`/api/projects`, "POST", params);
    }
}
exports.UploadPortfolioTool = UploadPortfolioTool;
