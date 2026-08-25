import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import User from './models/user.model.js';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/connecta';

async function seed() {
  try {
    console.log('Connecting to MongoDB at:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('Password123!', 10);
    const adminHashedPassword = await bcrypt.hash('AdminPassword123!', 10);

    const usersToSeed = [
      {
        firstName: 'Sarah',
        lastName: 'Chen',
        email: 'sarah.client@example.com',
        password: hashedPassword,
        userType: 'client',
        companyName: 'Chen Tech Solutions',
        jobTitle: 'Product Manager',
        isVerified: true,
        isActive: true,
      },
      {
        firstName: 'David',
        lastName: 'Okafor',
        email: 'david.client@example.com',
        password: hashedPassword,
        userType: 'client',
        companyName: 'Okafor Construction Ltd',
        jobTitle: 'Startup Founder',
        isVerified: true,
        isActive: true,
      },
      {
        firstName: 'Elena',
        lastName: 'Rodriguez',
        email: 'elena.freelancer@example.com',
        password: hashedPassword,
        userType: 'freelancer',
        jobTitle: 'UI Designer',
        isVerified: true,
        isActive: true,
      },
      {
        firstName: 'James',
        lastName: 'Smith',
        email: 'james.freelancer@example.com',
        password: hashedPassword,
        userType: 'freelancer',
        jobTitle: 'Backend Engineer',
        isVerified: true,
        isActive: true,
      },
      {
        firstName: 'Admin',
        lastName: 'Super',
        email: 'admin@myconnecta.ng',
        password: adminHashedPassword,
        userType: 'admin',
        isVerified: true,
        isActive: true,
      },
    ];

    for (const u of usersToSeed) {
      await User.findOneAndUpdate({ email: u.email }, u, { upsert: true, new: true });
      console.log(`✅ Seeded account: ${u.email}`);
    }

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
