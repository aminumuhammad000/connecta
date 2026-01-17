import mongoose, { Schema, Document } from "mongoose";

export interface ICollaboWorkspace extends Document {
    projectId: mongoose.Types.ObjectId;
    channels: {
        name: string;
        roleIds: mongoose.Types.ObjectId[]; // Roles allowed to access
    }[];
    tasks: any[]; // KanBan tasks placeholder
    files: any[]; // Files placeholder
    createdAt: Date;
    updatedAt: Date;
}

const CollaboWorkspaceSchema: Schema = new Schema(
    {
        projectId: { type: Schema.Types.ObjectId, ref: "CollaboProject", required: true },
        channels: [{
            name: { type: String, required: true },
            roleIds: [{ type: Schema.Types.ObjectId, ref: "ProjectRole" }]
        }],
        tasks: [{ type: Object }], // Define stricter schema later
        files: [{ type: Object }],
    },
    { timestamps: true }
);

export default mongoose.model<ICollaboWorkspace>("CollaboWorkspace", CollaboWorkspaceSchema);
