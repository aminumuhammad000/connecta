import { BaseTool } from "./base.tool";

export class OnboardingTool extends BaseTool {
  name = "onboarding_tool";
  description = "Run onboarding steps or return onboarding content.";

  async _call(params: Record<string, any>) {
return this.request(`/api/support/onboarding`, "POST", params);
  }
}
