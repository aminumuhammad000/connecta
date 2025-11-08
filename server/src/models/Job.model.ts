// src/models/Job.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IJob extends Document {
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  locationType: "remote" | "onsite" | "hybrid";
  jobType: "full-time" | "part-time" | "contract" | "freelance";
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  skills: string[];
  experience: string;
  posted: Date;
  deadline?: Date;
  applicants: number;
  status: "active" | "closed" | "draft";
  clientId: mongoose.Types.ObjectId;
  category: string;
  summary: string;
  budget: string;
  budgetType: string;
  connectsRequired: string;
  deliverables: string[];
  postedTime: string;
  paymentVerified: boolean;
  paymentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema<IJob> = new Schema(
  {
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
    clientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    summary: { type: String, default: "" },
    budget: { type: String, default: "" },
    budgetType: { type: String, default: "" },
    connectsRequired: { type: String, default: "" },
    deliverables: [{ type: String, default: "" }],
    postedTime: { type: String, default: "" },
    paymentVerified: { type: Boolean, default: false },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
  },
  { timestamps: true }
);

const Job = mongoose.model<IJob>("Job", JobSchema);
export default Job;
