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
        const profileId = params.profileId || params.userId || this.userId;
        // The Profile.routes uses PUT /api/profiles/:id
        return this.request(`/api/profiles/${profileId}`, "PUT", params);
    }
}
exports.UpdateProfileTool = UpdateProfileTool;
