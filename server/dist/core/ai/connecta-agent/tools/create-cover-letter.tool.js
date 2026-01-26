import { BaseTool } from "./base.tool.js";
export class CreateCoverLetterTool extends BaseTool {
    constructor() {
        super(...arguments);
        this.name = "create_cover_letter_tool";
        this.description = "Generate a personalized cover letter for a job.";
    }
    async _call(params) {
        // params: { jobTitle, jobDesc?, profileSummary?, tone?, extras? }
        return this.request(`/api/proposals/cover-letter`, "POST", params);
    }
}
