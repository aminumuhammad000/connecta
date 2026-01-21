import { BaseTool } from "./base.tool";
export class SummarizeConversationTool extends BaseTool {
    constructor() {
        super(...arguments);
        this.name = "summarize_conversation_tool";
        this.description = "Summarize a conversation or message thread.";
    }
    async _call(params) {
        return this.request(`/api/messages/thread/${params.threadId}/summarize`, "GET");
    }
}
