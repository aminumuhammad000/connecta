
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/models/user.model';

dotenv.config();

const checkUsers = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/connecta';
        console.log(`Connecting to MongoDB...`);

        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log(`Found ${users.length} users in the database.`);

        users.forEach(u => {
            console.log(`- ${u._id} : ${u.email} (${u.firstName} ${u.lastName})`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error checking users:', error);
    }
};

checkUsers();
