import { BaseTool } from "./base.tool";

export class UpdateProfileTool extends BaseTool {
  name = "update_profile_tool";
  description = "Update user profile fields such as name, bio, skills.";

  async _call(params: Record<string, any>) {
    return this.request(`/api/v1/profile/update`, "PATCH", params);
  }
}
