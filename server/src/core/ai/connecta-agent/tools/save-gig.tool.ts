import { BaseTool } from "./base.tool";

export class SaveGigTool extends BaseTool {
  name = "save_gig_tool";
  description = "Save a gig for later review.";

  async _call(params: Record<string, any>) {
return this.request(`/api/jobs/${params.gigId}/save`, "POST", params);
  }
}
