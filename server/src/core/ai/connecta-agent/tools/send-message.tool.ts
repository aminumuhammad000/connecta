import { BaseTool } from "./base.tool";

export class SendMessageTool extends BaseTool {
  name = "send_message_tool";
  description = "Send a message to another user.";

  async _call(params: Record<string, any>) {
    // params: { conversationId, senderId, receiverId, text, attachments? }
    return this.request(`/api/messages`, "POST", params);
  }
}
