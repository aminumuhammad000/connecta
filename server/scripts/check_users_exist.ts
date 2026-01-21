
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/user.model';

dotenv.config();

const checkUsers = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/connecta';
        await mongoose.connect(mongoUri);
        console.log('Connected to DB:', mongoUri);

        const users = await User.find({}, 'email firstName lastName userType');
        console.log('--- FOUND USERS ---');
        users.forEach(u => {
            console.log(`${u.email} (${u.userType}) - ${u._id}`);
        });
        console.log('-------------------');
        console.log(`Total: ${users.length}`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error checking users:', error);
    }
};

checkUsers();
