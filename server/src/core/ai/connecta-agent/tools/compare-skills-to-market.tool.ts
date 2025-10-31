import { BaseTool } from "./base.tool";

export class CompareSkillsToMarketTool extends BaseTool {
  name = "compare_skills_to_market_tool";
  description = "Compare user's skills with market demand/trends.";

  async _call(params: Record<string, any>) {
return this.request(`/api/analytics/skills/compare`, "POST", params);
  }
}
