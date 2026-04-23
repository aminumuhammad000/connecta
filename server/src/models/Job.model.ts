// src/models/Job.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IJob extends Document {
  title: string;
  description: string;
  budget: number;
  duration: number; // Delivery time in days
  status: "active" | "closed" | "draft" | "pending";
  clientId: mongoose.Types.ObjectId;
  category: string;
  skills: string[];
  budgetType?: string;
  jobType?: string;
  locationType?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema<IJob> = new Schema(
  {
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
  },
  { timestamps: true }
);

export const Job = mongoose.model<IJob>("Job", JobSchema);
export default Job;

