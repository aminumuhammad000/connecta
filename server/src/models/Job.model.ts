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
  jobType?: 'milestone_gig' | 'collabo_squad' | 'full_time_contract' | string;
  locationType?: string;
  monthlySalaryAmount?: number;
  currency?: string;
  probationPeriodDays?: number;
  noticePeriodDays?: number;
  benefitsSummary?: string;
  paymentVerified?: boolean;
  paymentStatus?: 'pending' | 'escrow' | 'released' | 'verified';
  requirements?: string[];
  isExternal?: boolean;
  company?: string;
  location?: string;
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
    jobType: { 
      type: String, 
      enum: ['milestone_gig', 'collabo_squad', 'full_time_contract', 'freelance', 'full-time', 'part-time', 'contract'],
      default: 'milestone_gig' 
    },
    locationType: { type: String, default: 'remote' },
    monthlySalaryAmount: { type: Number },
    currency: { type: String, default: 'USD' },
    probationPeriodDays: { type: Number, default: 30 },
    noticePeriodDays: { type: Number, default: 30 },
    benefitsSummary: { type: String },
    paymentVerified: { type: Boolean, default: false },
    paymentStatus: { type: String, enum: ['pending', 'escrow', 'released', 'verified'], default: 'pending' },
    requirements: [{ type: String }],
    isExternal: { type: Boolean, default: false },
    company: { type: String },
    location: { type: String, default: 'Remote' },
  },
  { timestamps: true }
);

export const Job = mongoose.model<IJob>("Job", JobSchema);
export default Job;

