import { BaseTool } from "./base.tool";
export class GetHelpTool extends BaseTool {
    constructor() {
        super(...arguments);
        this.name = "get_help_tool";
        this.description = "Return help / FAQ content for Connecta features.";
    }
    async _call(params) {
        return this.request(`/api/support/help`, "GET", params);
    }
}
