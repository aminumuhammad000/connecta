import { BaseTool } from "./base.tool";
export class SaveGigTool extends BaseTool {
    constructor() {
        super(...arguments);
        this.name = "save_gig_tool";
        this.description = "Save a gig for later review.";
    }
    async _call(params) {
        return this.request(`/api/jobs/${params.gigId}/save`, "POST", params);
    }
}
