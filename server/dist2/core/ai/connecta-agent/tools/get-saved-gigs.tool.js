"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSavedGigsTool = void 0;
const base_tool_1 = require("./base.tool");
class GetSavedGigsTool extends base_tool_1.BaseTool {
    constructor() {
        super(...arguments);
        this.name = "get_saved_gigs_tool";
        this.description = "Get gigs the user has saved.";
    }
    async _call(params) {
        const userId = params.userId || this.userId;
        return this.request(`/api/jobs/saved?userId=${userId}`, "GET");
    }
}
exports.GetSavedGigsTool = GetSavedGigsTool;
