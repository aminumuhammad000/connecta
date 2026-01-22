import { BaseTool } from "./base.tool";
export class GetMessagesTool extends BaseTool {
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
