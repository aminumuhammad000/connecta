"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaveGigTool = void 0;
const base_tool_1 = require("./base.tool");
class SaveGigTool extends base_tool_1.BaseTool {
    constructor() {
        super(...arguments);
        this.name = "save_gig_tool";
        this.description = "Save a gig for later review.";
    }
    async _call(params) {
        return this.request(`/api/jobs/${params.gigId}/save`, "POST", params);
    }
}
exports.SaveGigTool = SaveGigTool;
