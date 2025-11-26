// src/models/User.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  userType: "admin" | "freelancer" | "employer" | "client";
  isPremium?: boolean;
  premiumExpiryDate?: Date;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  profileImage?: string;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    userType: {
      type: String,
      enum: ["admin", "freelancer", "employer", "client"],
      required: true,
    isPremium: {
      type: Boolean,
      default: false,
    },
    premiumExpiryDate: {
      type: Date,
    },
      default: "freelancer",
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String, required: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
