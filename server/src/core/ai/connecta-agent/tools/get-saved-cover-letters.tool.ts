import { BaseTool } from "./base.tool";

export class GetSavedCoverLettersTool extends BaseTool {
  name = "get_saved_cover_letters_tool";
  description = "Get user's saved cover letters.";

  async _call(params: Record<string, any>) {
    const userId = params.userId || this.userId;
return this.request(`/api/proposals/cover-letters?userId=${userId}`, "GET");
  }
}
