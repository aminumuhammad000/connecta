"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingTool = void 0;
const base_tool_1 = require("./base.tool");
class OnboardingTool extends base_tool_1.BaseTool {
    constructor() {
        super(...arguments);
        this.name = "onboarding_tool";
        this.description = "Run onboarding steps or return onboarding content.";
    }
    async _call(params) {
        return this.request(`/api/support/onboarding`, "POST", params);
    }
}
exports.OnboardingTool = OnboardingTool;
