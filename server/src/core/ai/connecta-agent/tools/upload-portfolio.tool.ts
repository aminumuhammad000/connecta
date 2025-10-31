import { BaseTool } from "./base.tool";

export class UploadPortfolioTool extends BaseTool {
  name = "upload_portfolio_tool";
  description = "Upload or link a new portfolio project.";

  async _call(params: Record<string, any>) {
    // params expected: { userId?, project: { title, description, url, files? } }
    return this.request(`/api/v1/projects`, "POST", params);
  }
}
