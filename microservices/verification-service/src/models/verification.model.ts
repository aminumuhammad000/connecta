
import mongoose, { Schema, Document } from 'mongoose';

interface IVerification extends Document {
    userId: string;
    idType: string;
    idNumber: string;
    fullName: string;
    dateOfBirth?: Date;
    idFrontImage: string;
    idBackImage?: string;
    selfieImage?: string;
    status: 'pending' | 'approved' | 'rejected';
    adminNotes?: string;
    country: string;
    documentExpiryDate?: Date;
    addressProof?: string;
    createdAt: Date;
    updatedAt: Date;
}

const VerificationSchema: Schema = new Schema(
    {
        userId: { type: String, required: true, unique: true },
        idType: { type: String, required: true },
        idNumber: { type: String, required: true },
        fullName: { type: String, required: true },
        dateOfBirth: { type: Date },
        idFrontImage: { type: String, required: true },
        idBackImage: { type: String },
        selfieImage: { type: String },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        adminNotes: { type: String },
        country: { type: String, required: true },
        documentExpiryDate: { type: Date },
        addressProof: { type: String }
    },
    { timestamps: true }
);

export const Verification = mongoose.model<IVerification>('Verification', VerificationSchema);
