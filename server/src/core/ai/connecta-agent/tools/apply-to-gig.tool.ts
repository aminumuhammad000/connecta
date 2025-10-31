import { BaseTool } from "./base.tool";

export class ApplyToGigTool extends BaseTool {
  name = "apply_to_gig_tool";
  description = "Apply to a selected gig with optional cover letter.";

  async _call(params: Record<string, any>) {
    // params: { gigId, userId?, coverLetterId?, message }
return this.request(`/api/jobs/${params.gigId}/apply`, "POST", params);
  }
}
