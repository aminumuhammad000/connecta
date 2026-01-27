import { BaseTool } from "./base.tool.js";
export class GetProjectStatusTool extends BaseTool {
    constructor() {
        super(...arguments);
        this.name = "get_project_status_tool";
        this.description = "Get the details (including status) of a specific project.";
    }
    async _call(params) {
        return this.request(`/api/projects/${params.projectId}`, "GET");
    }
}
