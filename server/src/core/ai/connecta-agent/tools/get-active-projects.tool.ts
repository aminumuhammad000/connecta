import { BaseTool } from "./base.tool";

export class GetActiveProjectsTool extends BaseTool {
  name = "get_active_projects_tool";
  description = "Retrieve projects for a user (client or freelancer).";

  async _call(params: Record<string, any>) {
    const userId = params.userId || this.userId;
    const userType = (params.userType || params.role || '').toString().toLowerCase();
    const path = userType === 'client' ? `/api/projects/client/${userId}` : `/api/projects/freelancer/${userId}`;
    return this.request(path, "GET");
  }
}
