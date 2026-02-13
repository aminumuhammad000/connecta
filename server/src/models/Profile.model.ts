import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./user.model.js";

export interface IEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  description: string;
  startDate: Date;
  endDate?: Date;
}

export interface ILanguage {
  language: string;
  proficiency: "basic" | "conversational" | "fluent" | "native";
}

export interface IEmployment {
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
}

export interface IPortfolio {
  title: string;
  description: string;
  imageUrl?: string;
  projectUrl?: string;
  tags?: string[];
}

export interface IProfile extends Document {
  user: IUser["_id"]; // Reference to User model
  phoneNumber?: string;
  location?: string;
  country?: string;
  city?: string;
  timezone?: string;
  resume?: string; // Could be a URL to uploaded file
  skills?: string[]; // Array of skills
  preferredLanguage?: 'en' | 'ha';

  // Client-specific fields
  companyName?: string;
  website?: string;
  bio?: string;
  avatar?: string;

  // Onboarding / Preferences
  remoteWorkType?: 'remote_only' | 'hybrid' | 'onsite';
  minimumSalary?: number;
  workLocationPreferences?: string[];
  jobTitle?: string;
  jobCategories?: string[];
  yearsOfExperience?: number;
  engagementTypes?: string[];
  jobNotificationFrequency?: 'daily' | 'weekly' | 'relevant_only';

  education?: IEducation[];
  languages?: ILanguage[];
  employment?: IEmployment[];
  portfolio?: IPortfolio[];

  createdAt: Date;
  updatedAt: Date;
}

const EducationSchema = new Schema<IEducation>(
  {
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
  },
  { _id: false }
);

const LanguageSchema = new Schema<ILanguage>(
  {
    language: { type: String, required: true },
    proficiency: {
      type: String,
      enum: ["basic", "conversational", "fluent", "native"],
      default: "basic",
    },
  },
  { _id: false }
);

const EmploymentSchema = new Schema<IEmployment>(
  {
    company: { type: String, required: true },
    position: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    description: { type: String },
  },
  { _id: false }
);

const PortfolioSchema = new Schema<IPortfolio>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
    projectUrl: { type: String },
    tags: [{ type: String }],
  },
  { _id: true }
);

const ProfileSchema = new Schema<IProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    phoneNumber: { type: String },
    location: { type: String },
    country: { type: String },
    city: { type: String },
    timezone: { type: String },
    resume: { type: String },
    skills: [{ type: String }],
    preferredLanguage: { type: String, enum: ['en', 'ha'], default: 'en' },

    // Client-specific fields
    companyName: { type: String },
    website: { type: String },
    bio: { type: String },
    avatar: { type: String },

    // Onboarding / Preferences
    remoteWorkType: { type: String, enum: ['remote_only', 'hybrid', 'onsite'] },
    minimumSalary: { type: Number },
    workLocationPreferences: [{ type: String }],
    jobTitle: { type: String },
    jobCategories: [{ type: String }],
    yearsOfExperience: { type: Number },
    engagementTypes: [{ type: String, enum: ['full_time', 'part_time', 'contract', 'freelance', 'internship'] }],
    jobNotificationFrequency: { type: String, enum: ['daily', 'weekly', 'relevant_only'] },

    education: [EducationSchema],
    languages: [LanguageSchema],
    employment: [EmploymentSchema],
    portfolio: [PortfolioSchema],
  },
  { timestamps: true }
);

const Profile = mongoose.model<IProfile>("Profile", ProfileSchema);
export default Profile;
