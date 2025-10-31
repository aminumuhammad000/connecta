import { BaseTool } from "./base.tool";

export class GetRecommendedGigsTool extends BaseTool {
  name = "get_recommended_gigs_tool";
  description = "AI-driven gig recommendations beyond simple skill match.";

  async _call(params: Record<string, any>) {
    const userId = params.userId || this.userId;
    return this.request(`/api/v1/jobs/recommendations?userId=${userId}`, "GET");
  }
}
