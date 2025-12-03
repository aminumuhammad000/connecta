"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendMessageTool = void 0;
const base_tool_1 = require("./base.tool");
class SendMessageTool extends base_tool_1.BaseTool {
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
exports.SendMessageTool = SendMessageTool;
