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
  isActive?: boolean;
  isVerified?: boolean;
  pushToken?: string;
  preferredLanguage?: 'en' | 'ha';
  whatsapp?: string;
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
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    pushToken: { type: String, required: false },
    preferredLanguage: { type: String, enum: ['en', 'ha'], default: 'en' },
    whatsapp: { type: String, required: false },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);
export default User;

