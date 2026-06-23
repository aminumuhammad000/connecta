import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/connecta';

async function main() {
  console.log('🔗 Connecting to MongoDB:', MONGO_URI);
  await mongoose.connect(MONGO_URI);

  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const adminEmail = 'admin@connecta.ng';
  const newPassword = 'Password123!';

  console.log('Generating new hash...');
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  console.log('Force updating admin document...');
  const result = await User.updateOne(
    { email: adminEmail },
    { 
      $set: { 
        password: hashedPassword,
        userType: 'admin',
        role: 'admin',
        isEmailVerified: true 
      }
    },
    { upsert: true }
  );

  console.log('Database Result:', result.modifiedCount > 0 ? 'Updated existing' : 'Created new');
  console.log('✅ Admin reset complete.');
  console.log(`Login: ${adminEmail}`);
  console.log(`Password: ${newPassword}`);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
