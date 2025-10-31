import { BaseTool } from "./base.tool";

export class GetProjectStatusTool extends BaseTool {
  name = "get_project_status_tool";
  description = "Get the details (including status) of a specific project.";

  async _call(params: Record<string, any>) {
    return this.request(`/api/projects/${params.projectId}`, "GET");
  }
}
