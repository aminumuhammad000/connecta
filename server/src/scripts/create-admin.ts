import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/connecta';

async function main() {
  console.log('🔗 Connecting to MongoDB:', MONGO_URI);
  await mongoose.connect(MONGO_URI);

  // Fallback dynamic schema to create User if not fully imported
  const User = (mongoose.models.User || mongoose.model('User', new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    role: String,
    isEmailVerified: Boolean,
  }, { strict: false }))) as mongoose.Model<any>;

  const adminEmail = 'admin@connecta.ng';
  const adminPassword = 'AdminPassword123!';

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
    console.log(`✅ Admin account already exists: ${adminEmail}`);
    console.log('Login credentials:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    process.exit(0);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(adminPassword, salt);

  await User.create({
    firstName: 'Connecta',
    lastName: 'Admin',
    email: adminEmail,
    password: hashedPassword,
    role: 'admin',
    isEmailVerified: true,
  });

  console.log('🎉 Successfully created Connecta Admin Account!');
  console.log('====================================');
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
  console.log('====================================');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Failed to create admin script:', err.message);
  process.exit(1);
});
