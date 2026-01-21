// src/models/Job.model.ts
import mongoose, { Schema } from "mongoose";
const JobSchema = new Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    companyLogo: { type: String },
    location: { type: String, required: true },
    locationType: {
        type: String,
        enum: ["remote", "onsite", "hybrid"],
        required: true,
        default: "remote",
    },
    // Updated job type enums
    jobType: {
        type: String,
        enum: ["full-time", "part-time", "contract", "freelance", "one-time", "monthly", "permanent", "adhoc"],
        required: true,
        default: "full-time",
    },
    // New fields
    jobScope: {
        type: String,
        enum: ["local", "international"],
        default: "local"
    },
    niche: { type: String, required: false }, // e.g. IT, Hospitality, Health
    duration: { type: String }, // e.g. "3", "6"
    durationType: {
        type: String,
        enum: ["days", "weeks", "months", "years"],
        default: "months"
    },
    salary: {
        min: { type: Number },
        max: { type: Number },
        currency: { type: String, default: "USD" },
    },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    skills: [{ type: String }],
    experience: { type: String, required: true },
    posted: { type: Date, default: Date.now },
    deadline: { type: Date },
    applicants: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ["active", "closed", "draft"],
        default: "active",
    },
    clientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    summary: { type: String, default: "" },
    budget: { type: String, default: "" },
    budgetType: { type: String, default: "" },
    connectsRequired: { type: String, default: "" },
    deliverables: [{ type: String, default: "" }],
    postedTime: { type: String, default: "" },
    paymentVerified: { type: Boolean, default: false },
    paymentStatus: {
        type: String,
        enum: ["pending", "escrow", "released", "refunded"],
        default: "pending",
    },
    paymentReference: { type: String },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
    // External gig fields
    isExternal: { type: Boolean, default: false },
    externalId: { type: String },
    source: { type: String },
    applyUrl: { type: String },
    // Collabo fields
    jobMode: {
        type: String,
        enum: ["individual", "collabo"],
        default: "individual",
    },
    collaboRoles: [
        {
            title: { type: String },
            description: { type: String },
            budget: { type: Number },
            skills: [{ type: String }],
            count: { type: Number, default: 1 },
        },
    ],
}, { timestamps: true });
const Job = mongoose.model("Job", JobSchema);
export default Job;
