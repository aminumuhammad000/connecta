import { BaseTool } from "./base.tool";

export class FeedbackTool extends BaseTool {
  name = "feedback_tool";
  description = "Send feedback to Connecta team.";

  async _call(params: Record<string, any>) {
return this.request(`/api/support/feedback`, "POST", params);
  }
}
