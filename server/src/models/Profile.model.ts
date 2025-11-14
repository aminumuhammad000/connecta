import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./user.model";

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

export interface IProfile extends Document {
  user: IUser["_id"]; // Reference to User model
  phoneNumber?: string;
  location?: string;
  resume?: string; // Could be a URL to uploaded file
  skills?: string[]; // Array of skills

  education?: IEducation[];
  languages?: ILanguage[];
  employment?: IEmployment[];

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

const ProfileSchema = new Schema<IProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    phoneNumber: { type: String },
    location: { type: String },
    resume: { type: String },
    skills: [{ type: String }],

    education: [EducationSchema],
    languages: [LanguageSchema],
    employment: [EmploymentSchema],
  },
  { timestamps: true }
);

const Profile = mongoose.model<IProfile>("Profile", ProfileSchema);
export default Profile;
