// src/models/Job.model.ts
import mongoose, { Schema } from "mongoose";
const JobSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    budget: { type: Number, required: true },
    duration: { type: Number, required: true },
    status: {
        type: String,
        enum: ["active", "closed", "draft", "pending"],
        default: "active",
    },
    clientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    skills: [{ type: String }],
    budgetType: { type: String, default: 'fixed' },
    jobType: { type: String, default: 'freelance' },
    locationType: { type: String, default: 'remote' },
    paymentVerified: { type: Boolean, default: false },
    paymentStatus: { type: String, enum: ['pending', 'escrow', 'released', 'verified'], default: 'pending' },
    requirements: [{ type: String }],
    isExternal: { type: Boolean, default: false },
    company: { type: String },
}, { timestamps: true });
export const Job = mongoose.model("Job", JobSchema);
export default Job;
