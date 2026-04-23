import mongoose from 'mongoose';
import Profile from './src/models/Profile.model.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/connecta');
    const profiles = await Profile.find();
    console.log(profiles.map(p => ({
        id: p._id,
        user: p.user,
        companyName: p.companyName,
        website: p.website
    })));
    mongoose.disconnect();
};

run();
