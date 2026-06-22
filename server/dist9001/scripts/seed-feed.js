import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import FeedPost from '../models/Feed.model.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/connecta';
async function main() {
    await mongoose.connect(MONGO_URI);
    const fakeUserId = new mongoose.Types.ObjectId().toString();
    const fakeUser = {
        _id: fakeUserId,
        firstName: 'Test',
        lastName: 'User',
        jobTitle: 'Senior Tester',
        profileImage: 'https://ui-avatars.com/api/?name=Test+User'
    };
    await FeedPost.create({
        type: 'new_member',
        actor: fakeUser._id,
        actorName: 'Test User',
        actorAvatar: fakeUser.profileImage,
        title: 'Joined Connecta',
        body: 'Test User just joined the Connecta community. Welcome them!',
        emoji: '👋',
        targetAudience: 'all'
    });
    await FeedPost.create({
        type: 'job_posted',
        actor: fakeUser._id,
        actorName: 'Test User',
        actorAvatar: fakeUser.profileImage,
        title: 'Looking for a React Developer',
        body: 'Need an expert React Native developer for a 3-month project.',
        emoji: '💼',
        targetAudience: 'all'
    });
    await FeedPost.create({
        type: 'project_completed',
        actor: fakeUser._id,
        actorName: 'Test User',
        actorAvatar: fakeUser.profileImage,
        title: 'Completed a 5-star Project',
        body: 'Successfully delivered the Mobile App Redesign project.',
        emoji: '🏆',
        targetAudience: 'all'
    });
    await FeedPost.create({
        type: 'review_received',
        actor: fakeUser._id,
        actorName: 'Test User',
        actorAvatar: fakeUser.profileImage,
        title: 'Earned a 5-Star Review',
        body: '"Amazing work from Test User, very fast delivery!"',
        emoji: '⭐',
        targetAudience: 'all'
    });
    console.log('✅ Fake feed data generated via script!');
    await mongoose.disconnect();
}
main().catch(err => {
    console.error(err);
    process.exit(1);
});
