import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Notification from '../models/Notification.model.js';
import connectDB from '../config/db.config.js';

dotenv.config();

async function checkModel() {
    try {
        console.log('🔍 Checking Notification Model Definition...');

        // 1. Check the static model definition
        const schema: any = Notification.schema;
        const typeEnum = schema.path('type').options.enum;

        console.log('✅ Current Enum Values in Model:');
        console.log(JSON.stringify(typeEnum, null, 2));

        if (typeEnum.includes('job_invite')) {
            console.log('✨ SUCCESS: "job_invite" is present in the model definition.');
        } else {
            console.log('❌ FAILURE: "job_invite" is MISSING from the model definition.');
            console.log('Please ensure you have run "npm run build" after pulling the latest changes.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking model:', error);
        process.exit(1);
    }
}

connectDB().then(() => checkModel());
