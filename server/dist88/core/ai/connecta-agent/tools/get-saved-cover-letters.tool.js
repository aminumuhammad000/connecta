import { BaseTool } from "./base.tool";
export class GetSavedCoverLettersTool extends BaseTool {
    constructor() {
        super(...arguments);
        this.name = "get_saved_cover_letters_tool";
        this.description = "Get user's saved cover letters.";
    }
    async _call(params) {
        const userId = params.userId || this.userId;
        return this.request(`/api/proposals/cover-letters?userId=${userId}`, "GET");
    }
}
