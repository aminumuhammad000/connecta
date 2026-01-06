"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMatchedGigsTool = void 0;
const base_tool_1 = require("./base.tool");
class GetMatchedGigsTool extends base_tool_1.BaseTool {
    constructor() {
        super(...arguments);
        this.name = "get_matched_gigs_tool";
        this.description = "Get gigs that match the user's skills and preferences.";
    }
    async _call(params) {
        // Use the existing 'recommended' endpoint under /api/jobs
        const query = params.query || {};
        return this.request(`/api/jobs/recommended`, "GET", undefined, query);
    }
}
exports.GetMatchedGigsTool = GetMatchedGigsTool;
