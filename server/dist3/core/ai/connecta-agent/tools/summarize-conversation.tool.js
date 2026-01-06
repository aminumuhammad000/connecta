"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SummarizeConversationTool = void 0;
const base_tool_1 = require("./base.tool");
class SummarizeConversationTool extends base_tool_1.BaseTool {
    constructor() {
        super(...arguments);
        this.name = "summarize_conversation_tool";
        this.description = "Summarize a conversation or message thread.";
    }
    async _call(params) {
        return this.request(`/api/messages/thread/${params.threadId}/summarize`, "GET");
    }
}
exports.SummarizeConversationTool = SummarizeConversationTool;
