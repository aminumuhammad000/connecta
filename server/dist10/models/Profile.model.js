"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const EducationSchema = new mongoose_1.Schema({
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
}, { _id: false });
const LanguageSchema = new mongoose_1.Schema({
    language: { type: String, required: true },
    proficiency: {
        type: String,
        enum: ["basic", "conversational", "fluent", "native"],
        default: "basic",
    },
}, { _id: false });
const EmploymentSchema = new mongoose_1.Schema({
    company: { type: String, required: true },
    position: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    description: { type: String },
}, { _id: false });
const PortfolioSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
    projectUrl: { type: String },
    tags: [{ type: String }],
}, { _id: true });
const ProfileSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    phoneNumber: { type: String },
    location: { type: String },
    resume: { type: String },
    skills: [{ type: String }],
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
const Profile = mongoose_1.default.model("Profile", ProfileSchema);
exports.default = Profile;
