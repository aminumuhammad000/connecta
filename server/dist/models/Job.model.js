"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/Job.model.ts
const mongoose_1 = __importStar(require("mongoose"));
const JobSchema = new mongoose_1.Schema({
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
    jobType: {
        type: String,
        enum: ["full-time", "part-time", "contract", "freelance"],
        required: true,
        default: "full-time",
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
    clientId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    summary: { type: String, default: "" },
    budget: { type: String, default: "" },
    budgetType: { type: String, default: "" },
    connectsRequired: { type: String, default: "" },
    deliverables: [{ type: String, default: "" }],
    postedTime: { type: String, default: "" },
    paymentVerified: { type: Boolean, default: false },
    paymentId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Payment" },
}, { timestamps: true });
const Job = mongoose_1.default.model("Job", JobSchema);
exports.default = Job;
