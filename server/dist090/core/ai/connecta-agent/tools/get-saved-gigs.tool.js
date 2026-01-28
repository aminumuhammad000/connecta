import { BaseTool } from "./base.tool.js";
export class GetSavedGigsTool extends BaseTool {
    constructor() {
        super(...arguments);
        this.name = "get_saved_gigs_tool";
        this.description = "Get gigs the user has saved.";
    }
    async _call(params) {
        const userId = params.userId || this.userId;
        return this.request(`/api/jobs/saved?userId=${userId}`, "GET");
    }
}
