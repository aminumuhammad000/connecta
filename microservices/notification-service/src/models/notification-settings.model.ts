
import mongoose, { Schema, Document } from 'mongoose';

interface INotificationSettings extends Document {
    userId: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    criticalAlertsOnly: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSettingsSchema: Schema = new Schema(
    {
        userId: { type: String, required: true, unique: true },
        emailNotifications: { type: Boolean, default: true },
        pushNotifications: { type: Boolean, default: true },
        smsNotifications: { type: Boolean, default: false },
        criticalAlertsOnly: { type: Boolean, default: false }
    },
    { timestamps: true }
);

export const NotificationSettings = mongoose.model<INotificationSettings>('NotificationSettings', NotificationSettingsSchema);
