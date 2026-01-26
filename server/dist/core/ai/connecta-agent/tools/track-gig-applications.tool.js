import { BaseTool } from "./base.tool.js";
export class TrackGigApplicationsTool extends BaseTool {
    constructor() {
        super(...arguments);
        this.name = "track_gig_applications_tool";
        this.description = "Track status of user's gig applications.";
    }
    async _call(params) {
        const userId = params.userId || this.userId;
        return this.request(`/api/jobs/applications?userId=${userId}`, "GET");
    }
}
