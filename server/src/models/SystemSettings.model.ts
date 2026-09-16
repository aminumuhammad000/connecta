import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISystemSettings extends Document {
    general: {
        platformName: string;
        commissionRate: number;
        minWithdrawal: number;
        autoApproveProjects: boolean;
        emailNotifications: boolean;
        allowNewRegistrations: boolean;
        maintenanceMode: boolean;
    };
    security: {
        require2FA: boolean;
        sessionTimeout: number;
        maxLoginAttempts: number;
    };
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
    ai: {
        provider: 'openai' | 'gemini';
        openaiApiKey: string;
        geminiApiKey: string;
        model: string;
    };
    payments: {
        jobPostingFee: number;
    };
    contact: {
        email: string;
        phone: string;
        whatsapp: string;
        supportHours: string;
        supportChannel: string;
        address: string;
    };
    updatedAt: Date;
}

interface ISystemSettingsModel extends Model<ISystemSettings> {
    getSettings(): Promise<ISystemSettings>;
}

const SystemSettingsSchema: Schema = new Schema({
    general: {
        platformName: { type: String, default: 'Connecta' },
        commissionRate: { type: Number, default: 15 },
        minWithdrawal: { type: Number, default: 50 },
        autoApproveProjects: { type: Boolean, default: false },
        emailNotifications: { type: Boolean, default: true },
        allowNewRegistrations: { type: Boolean, default: true },
        maintenanceMode: { type: Boolean, default: false }
    },
    security: {
        require2FA: { type: Boolean, default: false },
        sessionTimeout: { type: Number, default: 30 },
        maxLoginAttempts: { type: Number, default: 5 }
    },
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
    },
    ai: {
        provider: { type: String, enum: ['openai', 'gemini'], default: 'openai' },
        openaiApiKey: { type: String, default: '' },
        geminiApiKey: { type: String, default: '' },
        model: { type: String, default: '' }
    },
    payments: {
        jobPostingFee: { type: Number, default: 500 } // Default 500 Naira
    },
    contact: {
        email: { type: String, default: 'support@myconnecta.ng' },
        phone: { type: String, default: '+234 812 345 6789' },
        whatsapp: { type: String, default: '+234 812 345 6789' },
        supportHours: { type: String, default: 'Mon – Sat: 8:00 AM – 8:00 PM WAT' },
        supportChannel: { type: String, default: 'Email, Phone, WhatsApp & 24/7 Live Chat' },
        address: { type: String, default: 'Abuja & Lagos, Nigeria' }
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
