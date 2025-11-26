"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchUsersTool = void 0;
const base_tool_1 = require("./base.tool");
class SearchUsersTool extends base_tool_1.BaseTool {
    constructor() {
        super(...arguments);
        this.name = "search_users_tool";
        this.description = "Search and list ALL users or freelancers in the system. Use this when user asks to 'show all freelancers', 'list users', 'find developers', etc. Params: userType (freelancer/client), skills, limit. Returns multiple user profiles.";
    }
    async _call(params) {
        try {
            // Build query parameters
            const queryParams = new URLSearchParams();
            if (params.userType) {
                queryParams.append('userType', params.userType);
            }
            if (params.skills) {
                queryParams.append('skills', params.skills);
            }
            if (params.limit) {
                queryParams.append('limit', params.limit.toString());
            }
            else {
                queryParams.append('limit', '20'); // Default limit
            }
            const endpoint = `/api/users${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            const response = await this.request(endpoint, "GET");
            if (!response.success) {
                return {
                    success: false,
                    message: "Could not fetch users. Please try again."
                };
            }
            // Return users data
            return {
                success: true,
                message: `Found ${response.data?.length || 0} users`,
                data: {
                    data: response.data || []
                }
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Error searching users"
            };
        }
    }
}
exports.SearchUsersTool = SearchUsersTool;
