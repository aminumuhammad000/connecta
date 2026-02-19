import mongoose, { Schema, Document } from 'mongoose';

interface INotification extends Document {
    userId: string;
    title: string;
    message: string;
    type: 'email' | 'push' | 'sms';
    read: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
    {
        userId: { type: String, required: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: { type: String, enum: ['email', 'push', 'sms'], required: true },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
