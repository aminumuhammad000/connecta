// src/models/Profile.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  bio?: string;
  phone?: string;
  address?: string;
  city?: string;
  nationality?: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema: Schema<IProfile> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // each user has one profile
    },
    bio: { type: String, default: "" },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    nationality: { type: String },
    profileImage: { type: String },
  },
  { timestamps: true }
);

const Profile = mongoose.model<IProfile>("Profile", ProfileSchema);
export default Profile;
