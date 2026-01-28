import { BaseTool } from "./base.tool.js";
export class ApplyToGigTool extends BaseTool {
    constructor() {
        super(...arguments);
        this.name = "apply_to_gig_tool";
        this.description = "Apply to a selected gig with optional cover letter.";
    }
    async _call(params) {
        // params: { gigId, userId?, coverLetterId?, message }
        // Map gigId to jobId for the Proposal controller
        const proposalData = {
            jobId: params.gigId,
            description: params.message || "I am interested in this job.",
            // Budget can be optionally passed or defaulted, but Controller handles fetching job details usually
            // We assume user wants to apply with job's budget or similar.
            // Ideally tool should accept budget too.
        };
        return this.request(`/api/proposals`, "POST", proposalData);
    }
}
