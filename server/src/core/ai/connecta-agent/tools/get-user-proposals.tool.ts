import { BaseTool } from "./base.tool";

export class GetUserProposalsTool extends BaseTool {
  name = "get_user_proposals_tool";
  description = "Retrieve proposals submitted by the user.";

  async _call(params: Record<string, any>) {
    return this.request(`/proposals/user/${params.userId || this.userId}`, "GET");
  }
}
