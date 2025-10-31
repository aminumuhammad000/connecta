import { BaseTool } from "./base.tool";

export class GetGigPerformanceTool extends BaseTool {
  name = "get_gig_performance_tool";
  description = "Get performance metrics for user's gigs/applications.";

  async _call(params: Record<string, any>) {
    const userId = params.userId || this.userId;
return this.request(`/api/analytics/gigs?userId=${userId}`, "GET");
  }
}
