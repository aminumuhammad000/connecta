"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfileTool = void 0;
const base_tool_1 = require("./base.tool");
class UpdateProfileTool extends base_tool_1.BaseTool {
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
exports.UpdateProfileTool = UpdateProfileTool;
