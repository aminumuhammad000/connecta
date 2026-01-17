import mongoose, { Schema, Document } from "mongoose";

export interface ICollaboTask extends Document {
    workspaceId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    status: "todo" | "in_progress" | "review" | "done";
    priority: "low" | "medium" | "high";
    assigneeId?: mongoose.Types.ObjectId; // User ID (Freelancer)
    createdBy: mongoose.Types.ObjectId; // User ID (Project Manager/Client)
    dueDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const CollaboTaskSchema: Schema = new Schema(
    {
        workspaceId: { type: Schema.Types.ObjectId, ref: "CollaboWorkspace", required: true },
        title: { type: String, required: true },
        description: { type: String },
        status: {
            type: String,
            enum: ["todo", "in_progress", "review", "done"],
            default: "todo",
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },
        assigneeId: { type: Schema.Types.ObjectId, ref: "User" },
        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        dueDate: { type: Date },
    },
    { timestamps: true }
);

export default mongoose.model<ICollaboTask>("CollaboTask", CollaboTaskSchema);
