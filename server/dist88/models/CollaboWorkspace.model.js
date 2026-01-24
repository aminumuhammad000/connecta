import mongoose, { Schema } from "mongoose";
const CollaboWorkspaceSchema = new Schema({
    projectId: { type: Schema.Types.ObjectId, ref: "CollaboProject", required: true },
    channels: [{
            name: { type: String, required: true },
            roleIds: [{ type: Schema.Types.ObjectId, ref: "ProjectRole" }]
        }],
    tasks: [{ type: Schema.Types.Mixed }], // Define stricter schema later
    files: [{ type: Schema.Types.Mixed }],
}, { timestamps: true });
export default mongoose.model("CollaboWorkspace", CollaboWorkspaceSchema);
