import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Review from '../models/Review.model.js';
dotenv.config();
async function fix() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('MONGODB_URI not found');
        process.exit(1);
    }
    await mongoose.connect(uri);
    console.log('Connected to DB');
    const result = await Review.updateMany({ reviewerType: { $ne: 'guest' }, isPublic: false }, { $set: { isPublic: true } });
    console.log('Updated reviews:', result.modifiedCount);
    await mongoose.disconnect();
    process.exit(0);
}
fix();
