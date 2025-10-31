import { BaseTool } from "./base.tool";

export class GetActiveProjectsTool extends BaseTool {
  name = "get_active_projects_tool";
  description = "Retrieve all active projects for a user.";

  async _call(params: Record<string, any>) {
    return this.request(`/projects/active?userId=${params.userId || this.userId}`, "GET");
  }
}
