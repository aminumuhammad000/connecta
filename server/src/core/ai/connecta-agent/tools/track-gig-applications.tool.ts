import { BaseTool } from "./base.tool";

export class TrackGigApplicationsTool extends BaseTool {
  name = "track_gig_applications_tool";
  description = "Track status of user's gig applications.";

  async _call(params: Record<string, any>) {
    const userId = params.userId || this.userId;
return this.request(`/api/jobs/applications?userId=${userId}`, "GET");
  }
}
