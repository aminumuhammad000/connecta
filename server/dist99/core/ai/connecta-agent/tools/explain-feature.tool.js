import { BaseTool } from "./base.tool";
export class ExplainFeatureTool extends BaseTool {
    constructor() {
        super(...arguments);
        this.name = "explain_feature_tool";
        this.description = "Explain a Connecta feature to the user.";
    }
    async _call(params) {
        return this.request(`/api/support/explain`, "POST", params);
    }
}
