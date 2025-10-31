import { BaseTool } from "./base.tool";

export class GetUserMessagesTool extends BaseTool {
  name = "get_user_messages_tool";
  description = "Fetch user’s messages or conversations.";

  async _call(params: Record<string, any>) {
    return this.request(`/api/messages/${params.userId || this.userId}`, "GET");
  }
}
