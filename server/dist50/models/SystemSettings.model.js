import mongoose, { Schema } from 'mongoose';
const SystemSettingsSchema = new Schema({
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
export default mongoose.model('SystemSettings', SystemSettingsSchema);
