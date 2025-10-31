import { BaseTool } from "./base.tool";

export class SuggestProfileImprovementsTool extends BaseTool {
  name = "suggest_profile_improvements_tool";
  description = "Return actionable suggestions for profile improvements.";

  async _call(params: Record<string, any>) {
    const userId = params.userId || this.userId;
    return this.request(`/api/v1/profile/${userId}/suggestions`, "GET");
  }
}
