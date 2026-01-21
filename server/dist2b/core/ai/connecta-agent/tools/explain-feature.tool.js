"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExplainFeatureTool = void 0;
const base_tool_1 = require("./base.tool");
class ExplainFeatureTool extends base_tool_1.BaseTool {
    constructor() {
        super(...arguments);
        this.name = "explain_feature_tool";
        this.description = "Explain a Connecta feature to the user.";
    }
    async _call(params) {
        return this.request(`/api/support/explain`, "POST", params);
    }
}
exports.ExplainFeatureTool = ExplainFeatureTool;
