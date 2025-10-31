import { BaseTool } from "./base.tool";

export class GetMessagesTool extends BaseTool {
  name = "get_messages_tool";
  description = "Fetch user conversations list.";

  async _call(params: Record<string, any>) {
    const userId = params.userId || this.userId;
    return this.request(`/api/messages/conversations/${userId}`, "GET");
  }
}
