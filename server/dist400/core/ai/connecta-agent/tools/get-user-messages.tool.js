import { BaseTool } from "./base.tool.js";
export class GetUserMessagesTool extends BaseTool {
    constructor() {
        super(...arguments);
        this.name = "get_user_messages_tool";
        this.description = "Fetch user’s messages or conversations.";
    }
    async _call(params) {
        return this.request(`/api/messages/${params.userId || this.userId}`, "GET");
    }
}
