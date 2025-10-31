import { BaseTool } from "./base.tool";

export class CreateCoverLetterTool extends BaseTool {
  name = "create_cover_letter_tool";
  description = "Generate a personalized cover letter for a job.";

  async _call(params: Record<string, any>) {
    // params: { jobTitle, jobDesc?, profileSummary?, tone?, extras? }
return this.request(`/api/proposals/cover-letter`, "POST", params);
  }
}
