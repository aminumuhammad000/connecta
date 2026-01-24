import { BaseTool } from "./base.tool";
export class FeedbackTool extends BaseTool {
    constructor() {
        super(...arguments);
        this.name = "feedback_tool";
        this.description = "Send feedback to Connecta team.";
    }
    async _call(params) {
        return this.request(`/api/support/feedback`, "POST", params);
    }
}
