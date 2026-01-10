"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCoverLetterTool = void 0;
const base_tool_1 = require("./base.tool");
class CreateCoverLetterTool extends base_tool_1.BaseTool {
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
exports.CreateCoverLetterTool = CreateCoverLetterTool;
