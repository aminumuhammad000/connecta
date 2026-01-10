"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetHelpTool = void 0;
const base_tool_1 = require("./base.tool");
class GetHelpTool extends base_tool_1.BaseTool {
    constructor() {
        super(...arguments);
        this.name = "get_help_tool";
        this.description = "Return help / FAQ content for Connecta features.";
    }
    async _call(params) {
        return this.request(`/api/support/help`, "GET", params);
    }
}
exports.GetHelpTool = GetHelpTool;
