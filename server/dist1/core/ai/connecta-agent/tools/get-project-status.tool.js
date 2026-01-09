"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProjectStatusTool = void 0;
const base_tool_1 = require("./base.tool");
class GetProjectStatusTool extends base_tool_1.BaseTool {
    constructor() {
        super(...arguments);
        this.name = "get_project_status_tool";
        this.description = "Get the details (including status) of a specific project.";
    }
    async _call(params) {
        return this.request(`/api/projects/${params.projectId}`, "GET");
    }
}
exports.GetProjectStatusTool = GetProjectStatusTool;
