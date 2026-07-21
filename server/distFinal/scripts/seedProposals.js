import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Proposal from '../models/Proposal.model.js';
import { Job } from '../models/Job.model.js';
import User from '../models/user.model.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const seedProposals = async () => {
    try {
        const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/connecta';
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');
        const jobs = await Job.find().limit(2);
        const freelancers = await User.find({ userType: 'freelancer' }).limit(3);
        if (jobs.length === 0 || freelancers.length === 0) {
            console.log('Not enough jobs or freelancers to create proposals');
            process.exit(1);
        }
        const proposals = [
            {
                description: 'I have 5 years of experience building scalable backend APIs. I can deliver this within a week.',
                coverLetter: 'I have 5 years of experience building scalable backend APIs. I can deliver this within a week.',
                price: 150000,
                proposedBudget: 150000,
                deliveryTime: 7,
                freelancerId: freelancers[0]._id,
                jobId: jobs[0]._id,
                clientId: jobs[0].clientId,
                status: 'pending',
            },
            {
                description: 'I am a UI/UX expert. Check out my portfolio. I would love to work on this project.',
                coverLetter: 'I am a UI/UX expert. Check out my portfolio. I would love to work on this project.',
                price: 200000,
                proposedBudget: 200000,
                deliveryTime: 14,
                freelancerId: freelancers[1] ? freelancers[1]._id : freelancers[0]._id,
                jobId: jobs[0]._id,
                clientId: jobs[0].clientId,
                status: 'accepted',
            },
            {
                description: 'I can do this for a cheaper price, but the quality will be top-notch.',
                coverLetter: 'I can do this for a cheaper price, but the quality will be top-notch.',
                price: 80000,
                proposedBudget: 80000,
                deliveryTime: 5,
                freelancerId: freelancers[2] ? freelancers[2]._id : freelancers[0]._id,
                jobId: jobs[1] ? jobs[1]._id : jobs[0]._id,
                clientId: jobs[1] ? jobs[1].clientId : jobs[0].clientId,
                status: 'rejected',
            }
        ];
        await Proposal.insertMany(proposals);
        console.log('Successfully seeded proposals (gig applications)');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding proposals:', error);
        process.exit(1);
    }
};
seedProposals();
