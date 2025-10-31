import { BaseTool } from "./base.tool";

export class GetSavedGigsTool extends BaseTool {
  name = "get_saved_gigs_tool";
  description = "Get gigs the user has saved.";

  async _call(params: Record<string, any>) {
    const userId = params.userId || this.userId;
return this.request(`/api/jobs/saved?userId=${userId}`, "GET");
  }
}
