import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SystemSettings from './src/models/SystemSettings.model.js';

dotenv.config();

async function checkSettings() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const settings = await SystemSettings.getSettings();
        console.log('--- System Settings ---');
        console.log(JSON.stringify(settings, null, 2));
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error checking settings:', error);
    }
}

checkSettings();
