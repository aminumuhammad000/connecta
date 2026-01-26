import { BaseTool } from "./base.tool.js";
export class OnboardingTool extends BaseTool {
    constructor() {
        super(...arguments);
        this.name = "onboarding_tool";
        this.description = "Run onboarding steps or return onboarding content.";
    }
    async _call(params) {
        return this.request(`/api/support/onboarding`, "POST", params);
    }
}
