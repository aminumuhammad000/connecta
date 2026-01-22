import { BaseTool } from "./base.tool";
export class EditCoverLetterTool extends BaseTool {
    constructor() {
        super(...arguments);
        this.name = "edit_cover_letter_tool";
        this.description = "Edit or rewrite an existing cover letter to be stronger.";
    }
    async _call(params) {
        return this.request(`/api/proposals/cover-letter/edit`, "PATCH", params);
    }
}
