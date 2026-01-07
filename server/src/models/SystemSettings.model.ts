import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISystemSettings extends Document {
    smtp: {
        provider: 'gmail' | 'other';
        host: string;
        port: number;
        user: string;
        pass: string;
        secure: boolean;
        fromEmail: string;
        fromName: string;
    };
    apiKeys: {
        openrouter: string;
        huggingface: string;
        google: {
            clientId: string;
            clientSecret: string;
            callbackUrl: string;
        };
    };
    updatedAt: Date;
}

interface ISystemSettingsModel extends Model<ISystemSettings> {
    getSettings(): Promise<ISystemSettings>;
}

const SystemSettingsSchema: Schema = new Schema({
    smtp: {
        provider: { type: String, enum: ['gmail', 'other'], default: 'other' },
        host: { type: String, default: '' },
        port: { type: Number, default: 587 },
        user: { type: String, default: '' },
        pass: { type: String, default: '' },
        secure: { type: Boolean, default: false },
        fromEmail: { type: String, default: '' },
        fromName: { type: String, default: 'Connecta' }
    },
    apiKeys: {
        openrouter: { type: String, default: '' },
        huggingface: { type: String, default: '' },
        google: {
            clientId: { type: String, default: '' },
            clientSecret: { type: String, default: '' },
            callbackUrl: { type: String, default: '' }
        }
    }
}, {
    timestamps: true
});

// Ensure only one settings document exists
SystemSettingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

export default mongoose.model<ISystemSettings, ISystemSettingsModel>('SystemSettings', SystemSettingsSchema);
