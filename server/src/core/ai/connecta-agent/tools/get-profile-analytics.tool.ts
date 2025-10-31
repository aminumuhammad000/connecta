import { BaseTool } from "./base.tool";

export class GetProfileAnalyticsTool extends BaseTool {
  name = "get_profile_analytics_tool";
  description = "Get analytics for a user's profile (views, clicks).";

  async _call(params: Record<string, any>) {
    const userId = params.userId || this.userId;
return this.request(`/api/analytics/profile?userId=${userId}`, "GET");
  }
}
