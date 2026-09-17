import mongoose, { Document, Schema } from "mongoose";

export type SupportStatus = 'Submitted' | 'In Progress' | 'Reviewed' | 'Resolved' | 'new' | 'read' | 'archived';

export interface IContact extends Document {
    userId?: mongoose.Types.ObjectId;
    name: string;
    email: string;
    subject: string;
    message: string;
    category?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    status: SupportStatus;
    adminResponse?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ContactSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: false },
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    category: { type: String, default: "General Support" },
    priority: {
        type: String,
        enum: ["low", "medium", "high", "urgent"],
        default: "medium"
    },
    status: {
        type: String,
        enum: ['Submitted', 'In Progress', 'Reviewed', 'Resolved', 'new', 'read', 'archived'],
        default: 'Submitted'
    },
    adminResponse: { type: String, default: "" },
}, { timestamps: true });

export const Contact = mongoose.model<IContact>("Contact", ContactSchema);
