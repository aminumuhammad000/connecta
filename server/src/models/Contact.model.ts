import mongoose, { Document, Schema } from "mongoose";

export interface IContact extends Document {
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'new' | 'read' | 'archived';
    createdAt: Date;
}

const ContactSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: {
        type: String,
        enum: ['new', 'read', 'archived'],
        default: 'new'
    },
}, { timestamps: true });

export const Contact = mongoose.model<IContact>("Contact", ContactSchema);
