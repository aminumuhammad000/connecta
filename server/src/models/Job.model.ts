// src/models/Job.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IJob extends Document {
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  locationType: "remote" | "onsite" | "hybrid";
  jobType: "full-time" | "part-time" | "contract" | "freelance" | "one-time" | "monthly" | "permanent" | "adhoc";
  jobScope: "local" | "international";
  niche?: string;
  duration?: string;
  durationType?: "days" | "weeks" | "months" | "years";
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
  paymentStatus: "pending" | "escrow" | "released" | "refunded";
  paymentReference?: string;
  paymentId?: mongoose.Types.ObjectId;

  // External gig fields
  isExternal?: boolean;
  externalId?: string;
  source?: string;
  applyUrl?: string;

  // External gig lifecycle tracking (for 14-day deletion policy)
  firstScrapedAt?: Date;
  lastScrapedAt?: Date;

  // Collabo fields
  jobMode: "individual" | "collabo";
  collaboRoles?: {
    title: string;
    description: string;
    budget: number;
    skills: string[];
    count: number;
  }[];

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

    // External gig lifecycle tracking (for 14-day deletion policy)
    firstScrapedAt: { type: Date },
    lastScrapedAt: { type: Date },

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
  },
  { timestamps: true }
);

// Export named only to avoid ESM default export issues
export const Job = mongoose.model<IJob>("Job", JobSchema);
