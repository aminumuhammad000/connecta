import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
dotenv.config();
async function testLogin() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/connecta';
        await mongoose.connect(mongoUri);
        const user = await User.findOne({ email: 'tunde@payflow.ng' }).select('+password');
        if (!user) {
            console.log('❌ User tunde@payflow.ng not found');
            process.exit(1);
        }
        const match = await bcrypt.compare('Password123!', user.password);
        console.log('🔍 Password Match Result:', match);
        console.log('👤 User Type:', user.userType);
        console.log('📧 Email:', user.email);
        process.exit(0);
    }
    catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}
testLogin();
