import { BaseTool } from "./base.tool";
export class UploadPortfolioTool extends BaseTool {
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
