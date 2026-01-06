"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserMessagesTool = void 0;
const base_tool_1 = require("./base.tool");
class GetUserMessagesTool extends base_tool_1.BaseTool {
    constructor() {
        super(...arguments);
        this.name = "get_user_messages_tool";
        this.description = "Fetch user’s messages or conversations.";
    }
    async _call(params) {
        return this.request(`/api/messages/${params.userId || this.userId}`, "GET");
    }
}
exports.GetUserMessagesTool = GetUserMessagesTool;
