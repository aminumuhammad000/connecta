import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SystemSettings from '../models/SystemSettings.model';
dotenv.config();
const setupDefaultEmailSettings = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/connecta';
        console.log(`Attempting to connect to MongoDB at ${uri}...`);
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB');
        // Get or create settings
        const settings = await SystemSettings.getSettings();
        // Set Gmail as default email service
        settings.smtp = {
            provider: 'gmail',
            host: 'smtp.gmail.com', // Gmail host (optional when using provider: 'gmail')
            port: 587,
            user: 'connectagigs@gmail.com',
            pass: 'rdgr pwnj jrlu nmxa',
            secure: false,
            fromEmail: 'connectagigs@gmail.com',
            fromName: 'Connecta'
        };
        await settings.save();
        console.log('✅ Default email settings saved successfully!');
        console.log('📧 Email service: Gmail');
        console.log('📧 From: connectagigs@gmail.com');
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    }
    catch (error) {
        console.error('❌ Error setting up email settings:', error);
        process.exit(1);
    }
};
setupDefaultEmailSettings();
