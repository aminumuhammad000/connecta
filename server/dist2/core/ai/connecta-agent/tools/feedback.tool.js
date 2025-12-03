"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackTool = void 0;
const base_tool_1 = require("./base.tool");
class FeedbackTool extends base_tool_1.BaseTool {
    constructor() {
        super(...arguments);
        this.name = "feedback_tool";
        this.description = "Send feedback to Connecta team.";
    }
    async _call(params) {
        return this.request(`/api/support/feedback`, "POST", params);
    }
}
exports.FeedbackTool = FeedbackTool;
