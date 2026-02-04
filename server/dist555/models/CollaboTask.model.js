import mongoose, { Schema } from "mongoose";
const CollaboTaskSchema = new Schema({
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
}, { timestamps: true });
export default mongoose.model("CollaboTask", CollaboTaskSchema);
