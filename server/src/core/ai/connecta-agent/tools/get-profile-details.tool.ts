import { BaseTool } from "./base.tool";

export class GetProfileDetailsTool extends BaseTool {
  name = "get_profile_details_tool";
  description = "Fetch user profile details.";

  async _call(params: Record<string, any>) {
    const userId = params.userId || this.userId;
    return this.request(`/api/v1/profile/${userId}`, "GET");
  }
}
