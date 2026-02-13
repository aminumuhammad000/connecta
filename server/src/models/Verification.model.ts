import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./user.model.js";

export interface IVerification extends Document {
    user: IUser["_id"];
    idType: "national_id" | "voters_card" | "passport" | "other";
    idNumber: string;
    fullName: string;
    dateOfBirth?: Date;
    idFrontImage: string;
    idBackImage?: string;
    selfieImage?: string;
    status: "pending" | "approved" | "rejected";
    adminNotes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const VerificationSchema: Schema<IVerification> = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        idType: {
            type: String,
            enum: ["national_id", "voters_card", "passport", "other"],
            required: true,
        },
        idNumber: { type: String, required: true },
        fullName: { type: String, required: true },
        dateOfBirth: { type: Date },
        idFrontImage: { type: String, required: true },
        idBackImage: { type: String },
        selfieImage: { type: String },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        adminNotes: { type: String },
    },
    { timestamps: true }
);

const Verification = mongoose.model<IVerification>("Verification", VerificationSchema);
export default Verification;
