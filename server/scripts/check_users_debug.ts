import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('MONGO_URI Present:', !!process.env.MONGO_URI);
if (process.env.MONGO_URI) {
    console.log('MONGO_URI Start:', process.env.MONGO_URI.substring(0, 15) + '...');
}

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing");
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

const checkFreelancers = async () => {
    await connectDB();

    try {
        // Define simple schema to check
        const UserSchema = new mongoose.Schema({
            firstName: String,
            lastName: String,
            userType: String,
            jobSuccessScore: Number,
            averageRating: Number
        });

        // Use existing collection 'users'
        const User = mongoose.model('User', UserSchema);

        const freelancers = await User.find({ userType: 'freelancer' })
            .select('firstName lastName userType jobSuccessScore averageRating')
            .limit(10);

        console.log(`Found ${freelancers.length} freelancers.`);
        console.log(JSON.stringify(freelancers, null, 2));

        if (freelancers.length === 0) {
            console.log('No freelancers found! This is why recommendation is empty.');

            // Check total users
            const totalUsers = await User.countDocuments();
            console.log(`Total users in DB: ${totalUsers}`);

            // Check user types
            const types = await User.distinct('userType');
            console.log('Available user types:', types);
        }

    } catch (error) {
        console.error('Error checking users:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkFreelancers();
