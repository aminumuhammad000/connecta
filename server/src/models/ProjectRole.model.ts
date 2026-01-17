import mongoose, { Schema, Document } from "mongoose";

export interface IProjectRole extends Document {
    projectId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    skills: string[];
    budget: number;
    status: "open" | "filled" | "completed" | "disputed";
    freelancerId?: mongoose.Types.ObjectId;
    paymentStatus: "pending" | "escrow" | "released";
    createdAt: Date;
    updatedAt: Date;
}

const ProjectRoleSchema: Schema = new Schema(
    {
        projectId: { type: Schema.Types.ObjectId, ref: "CollaboProject", required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        skills: [{ type: String }],
        budget: { type: Number, required: true },
        status: {
            type: String,
            enum: ["open", "filled", "completed", "disputed"],
            default: "open",
        },
        freelancerId: { type: Schema.Types.ObjectId, ref: "User" },
        paymentStatus: {
            type: String,
            enum: ["pending", "escrow", "released"],
            default: "pending",
        },
    },
    { timestamps: true }
);

export default mongoose.model<IProjectRole>("ProjectRole", ProjectRoleSchema);
