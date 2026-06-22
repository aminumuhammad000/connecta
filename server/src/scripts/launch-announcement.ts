/**
 * Seed Script: Launch Announcement
 * Run from server/ directory using: npx tsx src/scripts/launch-announcement.ts
 * (Or run it directly on the VPS if tsx is available)
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/connecta';

async function main() {
  console.log('🔗 Connecting to MongoDB:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  
  // Dynamically import the model to ensure it loads Mongoose properly
  const FeedPost = mongoose.models.FeedPost || mongoose.model('FeedPost', new mongoose.Schema({}, { strict: false }));

  console.log('📢 Creating Official Launch Announcement in Feed...');
  
  const announcementDoc = {
    type: 'user_post',
    actorName: 'Connecta Official',
    actorRole: 'admin',
    title: 'Welcome to the New Connecta Feed! 🎉',
    body: 'We have successfully launched the all-new fully transparent Feed ecosystem! Everything is live and verified. Keep an eye out for trending jobs, newly verified professionals, and successful project completions.',
    emoji: '🚀',
    targetAudience: 'all',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await FeedPost.create(announcementDoc);

  console.log('✅ Official Announcement successfully broadcasted to the live database!');
  
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Announcement failed:', err.message);
  process.exit(1);
});
