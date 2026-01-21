import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
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
