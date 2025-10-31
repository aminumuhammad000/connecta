import { BaseTool } from "./base.tool";

export class GetRecommendedGigsTool extends BaseTool {
  name = "get_recommended_gigs_tool";
  description = "AI-driven gig recommendations beyond simple skill match.";

  async _call(params: Record<string, any>) {
    // Using unified jobs router
    return this.request(`/api/jobs/recommended`, "GET");
  }
}
