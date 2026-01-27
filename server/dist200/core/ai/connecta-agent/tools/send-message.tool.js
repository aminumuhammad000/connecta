import { BaseTool } from "./base.tool.js";
export class SendMessageTool extends BaseTool {
    constructor() {
        super(...arguments);
        this.name = "send_message_tool";
        this.description = "Send a message to another user.";
    }
    async _call(params) {
        // params: { conversationId, senderId, receiverId, text, attachments? }
        return this.request(`/api/messages`, "POST", params);
    }
}
