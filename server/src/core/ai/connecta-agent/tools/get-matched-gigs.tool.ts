import { BaseTool } from "./base.tool";

export class GetMatchedGigsTool extends BaseTool {
  name = "get_matched_gigs_tool";
  description = "Get gigs that match the user's skills and preferences.";

  async _call(params: Record<string, any>) {
    const query = params.query || {};
    return this.request(`/api/v1/jobs/matched`, "GET", undefined, query);
  }
}
