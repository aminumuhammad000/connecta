import { BaseTool } from "./base.tool";

export class ExplainFeatureTool extends BaseTool {
  name = "explain_feature_tool";
  description = "Explain a Connecta feature to the user.";

  async _call(params: Record<string, any>) {
    return this.request(`/api/v1/support/explain`, "POST", params);
  }
}
