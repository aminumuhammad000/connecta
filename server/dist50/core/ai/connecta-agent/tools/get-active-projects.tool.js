import { BaseTool } from "./base.tool";
export class GetActiveProjectsTool extends BaseTool {
    constructor() {
        super(...arguments);
        this.name = "get_active_projects_tool";
        this.description = "Retrieve projects for a user (client or freelancer).";
    }
    async _call(params) {
        const userId = params.userId || this.userId;
        const userType = (params.userType || params.role || '').toString().toLowerCase();
        const path = userType === 'client' ? `/api/projects/client/${userId}` : `/api/projects/freelancer/${userId}`;
        return this.request(path, "GET");
    }
}
