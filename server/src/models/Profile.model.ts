import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./user.model.js";

export interface IProfile extends Document {
  user: IUser["_id"];
  primarySkill: string;
  subSkills: string[];
  yearsOfExperience: number;
  remoteWorkType: 'remote' | 'onsite' | 'hybrid';
  bio: string;
  whatsapp?: string;
  phoneNumber?: string;
  location: string;
  country?: string;
  city?: string;
  timezone?: string;
  preferredLanguage?: string;
  website?: string;
  companyName?: string;
  jobTitle: string;
  avatar?: string;
  skills: string[];
  education: any[];
  languages: any[];
  employment: any[];
  portfolio: any[];
  resume?: string;
  jobCategories: string[];
  minimumSalary?: number;
  workLocationPreferences?: string[];
  engagementTypes?: string[];
  jobNotificationFrequency?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    primarySkill: { type: String },
    subSkills: [{ type: String }],
    yearsOfExperience: { type: Number },
    remoteWorkType: { type: String, enum: ['remote', 'onsite', 'hybrid'] },
    jobCategories: [{ type: String }],
    bio: { type: String },
    whatsapp: { type: String },
    phoneNumber: { type: String },
    location: { type: String, default: 'Nigeria' },
    country: { type: String },
    city: { type: String },
    timezone: { type: String },
    preferredLanguage: { type: String },
    website: { type: String },
    companyName: { type: String },
    jobTitle: { type: String },
    avatar: { type: String },
    skills: [{ type: String }],
    education: [Schema.Types.Mixed],
    languages: [Schema.Types.Mixed],
    employment: [Schema.Types.Mixed],
    portfolio: [Schema.Types.Mixed],
    resume: { type: String },
    minimumSalary: { type: Number },
    workLocationPreferences: [{ type: String }],
    engagementTypes: [{ type: String }],
    jobNotificationFrequency: { type: String },
  },
  { timestamps: true }
);

const Profile = mongoose.model<IProfile>("Profile", ProfileSchema);
export default Profile;

