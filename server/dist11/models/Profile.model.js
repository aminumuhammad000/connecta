import mongoose, { Schema } from "mongoose";
const EducationSchema = new Schema({
    institution: { type: String, required: true },
    degree: { type: String },
    fieldOfStudy: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
}, { _id: false });
const LanguageSchema = new Schema({
    language: { type: String, required: true },
    proficiency: {
        type: String,
        enum: ["basic", "conversational", "fluent", "native"],
        default: "basic",
    },
}, { _id: false });
const EmploymentSchema = new Schema({
    company: { type: String, required: true },
    position: { type: String, required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    description: { type: String },
}, { _id: false });
const PortfolioSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
    projectUrl: { type: String },
    tags: [{ type: String }],
}, { _id: true });
const ProfileSchema = new Schema({
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
}, { timestamps: true });
const Profile = mongoose.model("Profile", ProfileSchema);
export default Profile;
