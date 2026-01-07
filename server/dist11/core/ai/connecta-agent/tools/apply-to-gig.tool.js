"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplyToGigTool = void 0;
const base_tool_1 = require("./base.tool");
class ApplyToGigTool extends base_tool_1.BaseTool {
    constructor() {
        super(...arguments);
        this.name = "apply_to_gig_tool";
        this.description = "Apply to a selected gig with optional cover letter.";
    }
    async _call(params) {
        // params: { gigId, userId?, coverLetterId?, message }
        return this.request(`/api/jobs/${params.gigId}/apply`, "POST", params);
    }
}
exports.ApplyToGigTool = ApplyToGigTool;
