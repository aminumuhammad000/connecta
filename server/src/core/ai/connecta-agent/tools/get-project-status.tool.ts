import { BaseTool } from "./base.tool";

export class GetProjectStatusTool extends BaseTool {
  name = "get_project_status_tool";
  description = "Get the status of a specific project.";

  async _call(params: Record<string, any>) {
    return this.request(`/projects/${params.projectId}/status`, "GET");
  }
}
