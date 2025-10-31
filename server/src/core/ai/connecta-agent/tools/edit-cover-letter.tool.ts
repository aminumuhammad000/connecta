import { BaseTool } from "./base.tool";

export class EditCoverLetterTool extends BaseTool {
  name = "edit_cover_letter_tool";
  description = "Edit or rewrite an existing cover letter to be stronger.";

  async _call(params: Record<string, any>) {
return this.request(`/api/proposals/cover-letter/edit`, "PATCH", params);
  }
}
