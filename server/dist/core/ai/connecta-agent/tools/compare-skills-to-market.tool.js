"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompareSkillsToMarketTool = void 0;
const base_tool_1 = require("./base.tool");
class CompareSkillsToMarketTool extends base_tool_1.BaseTool {
    constructor() {
        super(...arguments);
        this.name = "compare_skills_to_market_tool";
        this.description = "Compare user's skills with market demand/trends.";
    }
    async _call(params) {
        return this.request(`/api/analytics/skills/compare`, "POST", params);
    }
}
exports.CompareSkillsToMarketTool = CompareSkillsToMarketTool;
