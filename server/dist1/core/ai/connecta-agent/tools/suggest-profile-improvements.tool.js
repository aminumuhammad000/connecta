"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuggestProfileImprovementsTool = void 0;
const base_tool_1 = require("./base.tool");
class SuggestProfileImprovementsTool extends base_tool_1.BaseTool {
    constructor() {
        super(...arguments);
        this.name = "suggest_profile_improvements_tool";
        this.description = "Return actionable suggestions for profile improvements.";
    }
    async _call(params) {
        const userId = params.userId || this.userId;
        return this.request(`/api/v1/profile/${userId}/suggestions`, "GET");
    }
}
exports.SuggestProfileImprovementsTool = SuggestProfileImprovementsTool;
