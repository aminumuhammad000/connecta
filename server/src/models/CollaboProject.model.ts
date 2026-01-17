import mongoose, { Schema, Document } from "mongoose";

export interface ICollaboProject extends Document {
    title: string;
    description: string;
    clientId: mongoose.Types.ObjectId;
    totalBudget: number;
    category?: string;
    niche?: string;
    projectType?: "one-time" | "ongoing" | "permanent" | "adhoc";
    scope?: "local" | "international";
    duration?: string;
    durationType?: "days" | "weeks" | "months" | "years";
    status: "planning" | "active" | "completed" | "cancelled";
    workspaceId?: mongoose.Types.ObjectId;
    milestones: { title: string; description: string; duration: string; deliverables: string[] }[];
    recommendedStack: string[];
    risks: string[];
    createdAt: Date;
    updatedAt: Date;
}

const CollaboProjectSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        clientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
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
    },
    { timestamps: true }
);

export default mongoose.model<ICollaboProject>("CollaboProject", CollaboProjectSchema);
