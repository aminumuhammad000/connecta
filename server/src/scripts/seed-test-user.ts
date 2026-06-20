/**
 * Seed Script: Creates a test user for QA / Feed testing
 * Run from server/ directory with: npx tsx src/scripts/seed-test-user.ts
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/connecta';

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  userType: String,
  isVerified: Boolean,
  profileImage: String,
  jobTitle: String,
  bio: String,
  skills: [String],
  location: String,
  subscriptionStatus: String,
  subscriptionTier: String,
}, { strict: false, timestamps: true });

async function main() {
  console.log('🔗 Connecting to MongoDB:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected');

  const User = mongoose.models.User || mongoose.model('User', userSchema);

  // Remove existing test account
  await User.deleteOne({ email: 'testuser@connecta.ng' });

  const hashedPassword = await bcrypt.hash('Test@1234', 10);

  const user = await User.create({
    firstName: 'Alex',
    lastName: 'Tester',
    email: 'testuser@connecta.ng',
    password: hashedPassword,
    userType: 'freelancer',
    isVerified: true,
    profileImage: 'https://ui-avatars.com/api/?name=Alex+Tester&background=6366f1&color=fff&size=256',
    jobTitle: 'Full-Stack Developer',
    bio: 'Test account for QA purposes. Used to test the Connecta Social Feed.',
    skills: ['React Native', 'Node.js', 'TypeScript', 'MongoDB'],
    location: 'Lagos, Nigeria',
    subscriptionStatus: 'active',
    subscriptionTier: 'free',
  });

  console.log('\n🎉 Test User Created!');
  console.log('====================');
  console.log(`  Email:    testuser@connecta.ng`);
  console.log(`  Password: Test@1234`);
  console.log(`  Role:     Freelancer`);
  console.log(`  User ID:  ${user._id}`);
  console.log('====================\n');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});
