import { BaseTool } from "./base.tool";

export class GetHelpTool extends BaseTool {
  name = "get_help_tool";
  description = "Return help / FAQ content for Connecta features.";

  async _call(params: Record<string, any>) {
return this.request(`/api/support/help`, "GET", params);
  }
}
