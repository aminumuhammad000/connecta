import { BaseTool } from "./base.tool";

export class SendMessageTool extends BaseTool {
  name = "send_message_tool";
  description = "Send a message to another user.";

  async _call(params: Record<string, any>) {
    // params: { senderId, receiverId, content }
    return this.request(`/api/v1/messages/send`, "POST", params);
  }
}
