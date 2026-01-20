"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSavedCoverLettersTool = void 0;
const base_tool_1 = require("./base.tool");
class GetSavedCoverLettersTool extends base_tool_1.BaseTool {
    constructor() {
        super(...arguments);
        this.name = "get_saved_cover_letters_tool";
        this.description = "Get user's saved cover letters.";
    }
    async _call(params) {
        const userId = params.userId || this.userId;
        return this.request(`/api/proposals/cover-letters?userId=${userId}`, "GET");
    }
}
exports.GetSavedCoverLettersTool = GetSavedCoverLettersTool;
