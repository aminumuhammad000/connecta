import { BaseTool } from "./base.tool.js";
export class SaveCoverLetterTool extends BaseTool {
    constructor() {
        super(...arguments);
        this.name = "save_cover_letter_tool";
        this.description = "Save a generated cover letter to drafts.";
    }
    async _call(params) {
        return this.request(`/api/proposals/cover-letter/save`, "POST", params);
    }
}
