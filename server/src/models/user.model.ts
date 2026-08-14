// src/models/User.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  userType: "admin" | "freelancer" | "client";
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  profileImage?: string;
  title?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  country?: string;
  currency?: string;
  workType?: 'freelancing' | 'permanent';
  isActive?: boolean;
  isVerified?: boolean;
  verificationTier?: 'community' | 'vetted_pro' | 'top_1_percent';
  vettedAt?: Date;
  vettedBy?: mongoose.Types.ObjectId;
  skillAssessmentScores?: Array<{
    skill: string;
    score: number;
    verifiedAt: Date;
  }>;
  pushToken?: string;
  preferredLanguage?: 'en' | 'ha';
  whatsapp?: string;
  sparks?: number;
  companyName?: string;
  website?: string;
  companyOverview?: string;
  employment?: any[];
  workExperience?: Array<{
    role: string;
    company: string;
    period: string;
    description: string;
  }>;
  portfolio?: Array<{
    title: string;
    category?: string;
    image?: string;
    link?: string;
    description?: string;
  }>;
  hourlyRate?: number;
  yearsOfExperience?: number;
  privacySettings: {
    allowBroadcast: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    userType: {
      type: String,
      enum: ["admin", "freelancer", "client"],
      required: true,
      default: "freelancer",
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    profileImage: { type: String, required: false },
    title: { type: String, required: false, default: '' },
    bio: { type: String, required: false },
    location: { type: String, required: false, default: 'Lagos, Nigeria' },
    country: { type: String, required: false },
    currency: { type: String, required: false },
    companyName: { type: String, required: false },
    website: { type: String, required: false },
    companyOverview: { type: String, required: false },
    employment: [Schema.Types.Mixed],
    workExperience: [
      {
        role: { type: String },
        company: { type: String },
        period: { type: String },
        description: { type: String }
      }
    ],
    portfolio: [
      {
        title: { type: String },
        category: { type: String },
        image: { type: String },
        link: { type: String },
        description: { type: String }
      }
    ],
    hourlyRate: { type: Number, required: false },
    yearsOfExperience: { type: Number, required: false },
    workType: { type: String, enum: ['freelancing', 'permanent'], required: false },
    skills: [{ type: String }],
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    verificationTier: {
      type: String,
      enum: ['community', 'vetted_pro', 'top_1_percent'],
      default: 'community'
    },
    vettedAt: { type: Date },
    vettedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    skillAssessmentScores: [
      {
        skill: { type: String },
        score: { type: Number },
        verifiedAt: { type: Date, default: Date.now }
      }
    ],
    pushToken: { type: String, required: false },
    preferredLanguage: { type: String, enum: ['en', 'ha'], default: 'en' },
    whatsapp: { type: String, required: false },
    sparks: { type: Number, default: 0 },
    privacySettings: {
      allowBroadcast: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);
export default User;

