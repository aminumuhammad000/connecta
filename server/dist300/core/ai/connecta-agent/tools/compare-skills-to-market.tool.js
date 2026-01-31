import { BaseTool } from "./base.tool.js";
export class CompareSkillsToMarketTool extends BaseTool {
    constructor() {
        super(...arguments);
        this.name = "compare_skills_to_market_tool";
        this.description = "Compare user's skills with market demand/trends.";
    }
    async _call(params) {
        return this.request(`/api/analytics/skills/compare`, "POST", params);
    }
}
