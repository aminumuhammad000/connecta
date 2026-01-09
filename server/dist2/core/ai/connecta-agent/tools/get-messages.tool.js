"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMessagesTool = void 0;
const base_tool_1 = require("./base.tool");
class GetMessagesTool extends base_tool_1.BaseTool {
    constructor() {
        super(...arguments);
        this.name = "get_messages_tool";
        this.description = "Fetch user conversations list.";
    }
    async _call(params) {
        const userId = params.userId || this.userId;
        return this.request(`/api/messages/conversations/${userId}`, "GET");
    }
}
exports.GetMessagesTool = GetMessagesTool;
