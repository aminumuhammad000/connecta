import { BaseTool } from "./base.tool";

export class SaveCoverLetterTool extends BaseTool {
  name = "save_cover_letter_tool";
  description = "Save a generated cover letter to drafts.";

  async _call(params: Record<string, any>) {
    return this.request(`/api/v1/proposals/cover-letter/save`, "POST", params);
  }
}
