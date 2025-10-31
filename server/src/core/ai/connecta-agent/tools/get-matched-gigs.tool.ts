import { BaseTool } from "./base.tool";

export class GetMatchedGigsTool extends BaseTool {
  name = "get_matched_gigs_tool";
  description = "Get gigs that match the user's skills and preferences.";

  async _call(params: Record<string, any>) {
    // Use the existing 'recommended' endpoint under /api/jobs
    const query = params.query || {};
    return this.request(`/api/jobs/recommended`, "GET", undefined, query);
  }
}
