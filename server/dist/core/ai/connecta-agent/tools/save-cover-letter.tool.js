"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaveCoverLetterTool = void 0;
const base_tool_1 = require("./base.tool");
class SaveCoverLetterTool extends base_tool_1.BaseTool {
    constructor() {
        super(...arguments);
        this.name = "save_cover_letter_tool";
        this.description = "Save a generated cover letter to drafts.";
    }
    async _call(params) {
        return this.request(`/api/proposals/cover-letter/save`, "POST", params);
    }
}
exports.SaveCoverLetterTool = SaveCoverLetterTool;
