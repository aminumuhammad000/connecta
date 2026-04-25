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
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    pushToken: { type: String, required: false },
    preferredLanguage: { type: String, enum: ['en', 'ha'], default: 'en' },
    whatsapp: { type: String, required: false },
    sparks: { type: Number, default: 0 },
}, { timestamps: true });
const User = mongoose.model("User", UserSchema);
export default User;
