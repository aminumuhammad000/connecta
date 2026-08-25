import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/user.model.js';

dotenv.config();

async function fixTundePassword() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/connecta';
    await mongoose.connect(mongoUri);

    const passwordHash = await bcrypt.hash('Password123!', 10);
    const user = await User.findOneAndUpdate(
      { email: 'tunde@payflow.ng' },
      {
        password: passwordHash,
        userType: 'client',
        companyName: 'PayFlow Financial & Logistics',
        isVerified: true,
      },
      { upsert: true, new: true }
    );

    console.log('✅ Re-hashed password for tunde@payflow.ng:', user._id);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to update password:', err);
    process.exit(1);
  }
}

fixTundePassword();
