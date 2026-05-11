import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Job } from './models/Job.model.js';
import User from './models/user.model.js';
import Profile from './models/Profile.model.js';
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/connecta';
async function debugRecommendations() {
    try {
        await mongoose.connect(MONGODB_URI);
        const user = await User.findOne({ userType: 'freelancer' });
        if (!user) {
            console.log('No freelancer found');
            await mongoose.disconnect();
            return;
        }
        console.log('Testing for user:', user.email, 'ID:', user._id);
        const profile = await Profile.findOne({ user: user._id });
        console.log('Profile skills:', profile?.skills);
        const activeJobs = await Job.find({ status: 'active' });
        console.log('Total active jobs in DB:', activeJobs.length);
        // Simulate controller logic
        let filter = { status: "active" };
        const orConditions = [];
        if (profile) {
            if (profile.skills && profile.skills.length > 0) {
                orConditions.push({ skills: { $in: profile.skills } });
            }
            if (orConditions.length > 0) {
                filter.$or = orConditions;
            }
        }
        console.log('Filter used:', JSON.stringify(filter));
        let jobs = await Job.find(filter).limit(50);
        console.log('Jobs found with filter:', jobs.length);
        if (jobs.length < 5) {
            console.log('Applying fallback...');
            const fallbackJobs = await Job.find({ status: "active" }).limit(10);
            console.log('Fallback jobs found:', fallbackJobs.length);
            const jobIds = new Set(jobs.map(j => j._id.toString()));
            fallbackJobs.forEach(j => {
                if (!jobIds.has(j._id.toString())) {
                    jobs.push(j);
                }
            });
        }
        console.log('Final jobs count:', jobs.length);
        await mongoose.disconnect();
    }
    catch (error) {
        console.error('Error:', error);
    }
}
debugRecommendations();
