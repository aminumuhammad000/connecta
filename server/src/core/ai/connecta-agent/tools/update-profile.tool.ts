import { BaseTool } from "./base.tool";

export class UpdateProfileTool extends BaseTool {
  name = "update_profile_tool";
  description = "Update user profile fields such as phoneNumber, location, resume, etc.";

  async _call(params: Record<string, any>) {
    const profileId = params.profileId || params.userId || this.userId;
    // The Profile.routes uses PUT /api/profiles/:id
    return this.request(`/api/profiles/${profileId}`, "PUT", params);
  }
}
