
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/user.model.js';
import connectDB from '../src/config/db.config.js';

dotenv.config();

const sampleUsers = [
    {
        firstName: "Sarah",
        lastName: "Jenkins",
        email: "sarah.jenkins@example.com",
        password: "password123",
        role: "client",
        isVerified: true,
        profilePicture: "https://i.pravatar.cc/150?u=sarah"
    },
    {
        firstName: "David",
        lastName: "Okon",
        email: "david.okon@example.com",
        password: "password123",
        role: "client",
        isVerified: true,
        profilePicture: "https://i.pravatar.cc/150?u=david"
    },
    {
        firstName: "Team",
        lastName: "Alpha",
        email: "team.alpha@example.com",
        password: "password123",
        role: "freelancer",
        isVerified: true,
        profilePicture: "https://i.pravatar.cc/150?u=alpha"
    }
];

async function seedUsers() {
    try {
        await connectDB();
        console.log('✅ Connected to database');

        for (const user of sampleUsers) {
            const existingUser = await User.findOne({ email: user.email });
            if (!existingUser) {
                await User.create(user);
                console.log(`✅ Created user: ${user.firstName} ${user.lastName}`);
            } else {
                console.log(`ℹ️ User already exists: ${user.firstName} ${user.lastName}`);
            }
        }

        console.log('🎉 Users seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding users:', error);
        process.exit(1);
    }
}

seedUsers();
