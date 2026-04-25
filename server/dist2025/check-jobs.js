import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Job } from './models/Job.model.js';
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/connecta';
async function checkJobs() {
    try {
        await mongoose.connect(MONGODB_URI);
        const count = await Job.countDocuments();
        const activeCount = await Job.countDocuments({ status: 'active' });
        console.log(`Total jobs: ${count}`);
        console.log(`Active jobs: ${activeCount}`);
        if (count > 0) {
            const oneJob = await Job.findOne();
            console.log('Sample Job:', JSON.stringify(oneJob, null, 2));
        }
        await mongoose.disconnect();
    }
    catch (error) {
        console.error('Error:', error);
    }
}
checkJobs();
