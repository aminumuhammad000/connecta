"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditCoverLetterTool = void 0;
const base_tool_1 = require("./base.tool");
class EditCoverLetterTool extends base_tool_1.BaseTool {
    constructor() {
        super(...arguments);
        this.name = "edit_cover_letter_tool";
        this.description = "Edit or rewrite an existing cover letter to be stronger.";
    }
    async _call(params) {
        return this.request(`/api/proposals/cover-letter/edit`, "PATCH", params);
    }
}
exports.EditCoverLetterTool = EditCoverLetterTool;
