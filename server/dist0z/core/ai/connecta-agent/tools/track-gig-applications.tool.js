"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackGigApplicationsTool = void 0;
const base_tool_1 = require("./base.tool");
class TrackGigApplicationsTool extends base_tool_1.BaseTool {
    constructor() {
        super(...arguments);
        this.name = "track_gig_applications_tool";
        this.description = "Track status of user's gig applications.";
    }
    async _call(params) {
        const userId = params.userId || this.userId;
        return this.request(`/api/jobs/applications?userId=${userId}`, "GET");
    }
}
exports.TrackGigApplicationsTool = TrackGigApplicationsTool;
