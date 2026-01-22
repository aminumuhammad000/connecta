import { BaseTool } from "./base.tool";
export class SuggestProfileImprovementsTool extends BaseTool {
    constructor() {
        super(...arguments);
        this.name = "suggest_profile_improvements_tool";
        this.description = "Return actionable suggestions for profile improvements.";
    }
    async _call(params) {
        const userId = params.userId || this.userId;
        return this.request(`/api/v1/profile/${userId}/suggestions`, "GET");
    }
}
