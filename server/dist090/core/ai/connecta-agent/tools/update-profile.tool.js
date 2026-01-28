import { BaseTool } from "./base.tool.js";
export class UpdateProfileTool extends BaseTool {
    constructor() {
        super(...arguments);
        this.name = "update_profile_tool";
        this.description = "Update user profile fields such as phoneNumber, location, resume, etc.";
    }
    async _call(params) {
        // If specific profileId (ObjectId) is provided, use it.
        // Otherwise, default to updating the current user's profile via /me
        if (params.profileId && params.profileId.length === 24) {
            return this.request(`/api/profiles/${params.profileId}`, "PUT", params);
        }
        return this.request(`/api/profiles/me`, "PUT", params);
    }
}
