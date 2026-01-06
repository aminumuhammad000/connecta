"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserProposalsTool = void 0;
const base_tool_1 = require("./base.tool");
class GetUserProposalsTool extends base_tool_1.BaseTool {
    constructor() {
        super(...arguments);
        this.name = "get_user_proposals_tool";
        this.description = "Retrieve proposals submitted by the user.";
    }
    async _call(params) {
        return this.request(`/api/proposals/freelancer/${params.userId || this.userId}`, "GET");
    }
}
exports.GetUserProposalsTool = GetUserProposalsTool;
