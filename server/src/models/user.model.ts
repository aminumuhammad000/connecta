// src/models/User.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  userType: "admin" | "freelancer" | "employer" | "client";
  isPremium?: boolean;
  subscriptionTier?: "free" | "premium" | "enterprise";
  subscriptionStatus?: "active" | "expired" | "cancelled";
  premiumExpiryDate?: Date;
  savedJobs?: any[];
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  profileImage?: string;
  isActive?: boolean;
  isVerified?: boolean;
  pushToken?: string;
  isSubscribedToGigs?: boolean;
  emailFrequency?: "daily" | "weekly" | "monthly";

  // Reputation & Badges
  averageRating: number;
  totalReviews: number;
  jobSuccessScore: number;
  badges: string[];
  performanceMetrics: {
    onTimeDeliveryRate: number;
    completionRate: number;
    responseTime: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    userType: {
      type: String,
      enum: ["admin", "freelancer", "employer", "client"],
      required: true,
      default: "freelancer",
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    subscriptionTier: {
      type: String,
      enum: ["free", "premium", "enterprise"],
      default: "free",
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
    premiumExpiryDate: {
      type: Date,
    },
    savedJobs: [{ type: Schema.Types.ObjectId, ref: "Job" }],
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String, required: false },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    pushToken: { type: String, required: false },
    isSubscribedToGigs: { type: Boolean, default: true },
    emailFrequency: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      default: "daily",
    },

    // Reputation & Badges
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    jobSuccessScore: { type: Number, default: 100 }, // Percentage (0-100)
    badges: {
      type: [String],
      enum: ["rising_talent", "top_rated", "expert_vetted", "verified_pro"],
      default: [],
    },
    performanceMetrics: {
      onTimeDeliveryRate: { type: Number, default: 100 }, // Percentage
      completionRate: { type: Number, default: 100 }, // Percentage
      responseTime: { type: Number, default: 24 }, // Avg hours (default 24h)
    },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
