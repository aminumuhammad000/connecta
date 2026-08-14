// src/models/User.model.ts
import mongoose, { Schema } from "mongoose";
const UserSchema = new Schema({
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
}, { timestamps: true });
const User = mongoose.model("User", UserSchema);
export default User;
