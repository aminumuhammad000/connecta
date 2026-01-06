"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProfileDetailsTool = void 0;
const base_tool_1 = require("./base.tool");
class GetProfileDetailsTool extends base_tool_1.BaseTool {
    constructor() {
        super(...arguments);
        this.name = "get_profile_details_tool";
        this.description = "Fetch a SINGLE user's profile details by their profile ID or user ID. Use this only when user asks about their own profile or a specific user. NOT for listing multiple users.";
    }
    async _call(params) {
        const userId = params.userId || this.userId;
        if (!userId) {
            return { success: false, message: "User ID is required" };
        }
        // Fetch user directly from /api/users/:id
        const response = await this.request(`/api/users/${userId}`, "GET");
        if (!response.success) {
            return {
                success: false,
                message: "Could not fetch your profile details. Please try again."
            };
        }
        return {
            success: true,
            data: response.data
        };
    }
}
exports.GetProfileDetailsTool = GetProfileDetailsTool;
