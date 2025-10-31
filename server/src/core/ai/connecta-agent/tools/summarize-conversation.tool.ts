import { BaseTool } from "./base.tool";

export class SummarizeConversationTool extends BaseTool {
  name = "summarize_conversation_tool";
  description = "Summarize a conversation or message thread.";

  async _call(params: Record<string, any>) {
    return this.request(`/api/v1/messages/${params.threadId}/summarize`, "GET");
  }
}
