import { BaseTool } from "./base.tool.js";
export class GetUserProposalsTool extends BaseTool {
    constructor() {
        super(...arguments);
        this.name = "get_user_proposals_tool";
        this.description = "Retrieve proposals submitted by the user.";
    }
    async _call(params) {
        return this.request(`/api/proposals/freelancer/${params.userId || this.userId}`, "GET");
    }
}
