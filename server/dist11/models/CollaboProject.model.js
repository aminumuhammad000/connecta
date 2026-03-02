import mongoose, { Schema } from "mongoose";
const CollaboProjectSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    clientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    teamName: { type: String },
    totalBudget: { type: Number, required: true },
    category: { type: String },
    niche: { type: String },
    projectType: {
        type: String,
        enum: ["one-time", "ongoing", "permanent", "adhoc"],
        default: "one-time"
    },
    scope: {
        type: String,
        enum: ["local", "international"],
        default: "local"
    },
    duration: { type: String },
    durationType: { type: String, enum: ["days", "weeks", "months", "years"], default: "months" },
    status: {
        type: String,
        enum: ["planning", "active", "completed", "cancelled"],
        default: "planning",
    },
    workspaceId: { type: Schema.Types.ObjectId, ref: "CollaboWorkspace" },
    milestones: [{
            title: String,
            description: String,
            duration: String,
            deliverables: [String]
        }],
    recommendedStack: [String],
    risks: [String]
}, { timestamps: true });
export default mongoose.model("CollaboProject", CollaboProjectSchema);
