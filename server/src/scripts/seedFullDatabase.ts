import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Models
import FeedPost from '../models/Feed.model.js';
import Job from '../models/Job.model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/connecta';

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.User || mongoose.model('User', userSchema);

async function main() {
  console.log('🔗 Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected.');

  console.log('🧹 Clearing existing seed data...');
  // Only clear the dynamically generated ones so we keep the exact testuser@gmail.com
  await User.deleteMany({ email: { $ne: 'testuser@gmail.com' }, userType: { $in: ['client', 'freelancer'] } });
  await Job.deleteMany({});
  await FeedPost.deleteMany({});

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // 1. Create Users
  console.log('🧑‍💻 Creating Users...');
  const usersToCreate = [
    {
      firstName: 'Sarah',
      lastName: 'Chen',
      email: 'sarah.client@example.com',
      password: hashedPassword,
      userType: 'client',
      isVerified: true,
      profileImage: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=random',
      jobTitle: 'Product Manager at TechCorp',
      location: 'San Francisco, CA',
    },
    {
      firstName: 'David',
      lastName: 'Okafor',
      email: 'david.client@example.com',
      password: hashedPassword,
      userType: 'client',
      isVerified: true,
      profileImage: 'https://ui-avatars.com/api/?name=David+Okafor&background=random',
      jobTitle: 'Startup Founder',
      location: 'Lagos, Nigeria',
    },
    {
      firstName: 'Elena',
      lastName: 'Rodriguez',
      email: 'elena.freelancer@example.com',
      password: hashedPassword,
      userType: 'freelancer',
      isVerified: true,
      profileImage: 'https://ui-avatars.com/api/?name=Elena+Rodriguez&background=random',
      jobTitle: 'UI/UX Designer',
      skills: ['Figma', 'UI Design', 'Wireframing'],
      location: 'Madrid, Spain',
    },
    {
      firstName: 'James',
      lastName: 'Smith',
      email: 'james.freelancer@example.com',
      password: hashedPassword,
      userType: 'freelancer',
      isVerified: true,
      profileImage: 'https://ui-avatars.com/api/?name=James+Smith&background=random',
      jobTitle: 'Backend Engineer',
      skills: ['Node.js', 'Python', 'AWS'],
      location: 'London, UK',
    }
  ];

  const createdUsers = await User.insertMany(usersToCreate);
  const client1 = createdUsers.find(u => u.email === 'sarah.client@example.com');
  const client2 = createdUsers.find(u => u.email === 'david.client@example.com');
  const freelancer1 = createdUsers.find(u => u.email === 'elena.freelancer@example.com');
  const freelancer2 = createdUsers.find(u => u.email === 'james.freelancer@example.com');

  // Generate feed events for new members
  for (const user of createdUsers) {
    await FeedPost.create({
      type: 'new_member',
      actor: user._id,
      actorName: `${user.firstName} ${user.lastName}`,
      actorAvatar: user.profileImage,
      actorRole: user.jobTitle,
      title: `Welcome ${user.firstName}!`,
      body: `${user.firstName} just joined Connecta as a ${user.userType}. Make sure to say hi!`,
      emoji: '👋',
      targetAudience: 'all'
    });
  }

  // 2. Create Jobs
  console.log('💼 Creating Jobs...');
  const jobs = [
    {
      clientId: client1._id,
      title: 'Mobile App Redesign (Figma)',
      description: 'We are looking for an experienced UI/UX designer to completely overhaul our mobile app interface. Must be highly skilled in Figma and user-centric design principles.',
      category: 'Design & Creative',
      skills: ['Figma', 'Mobile Design', 'UI/UX'],
      budget: 1500,
      duration: 30,
      status: 'active',
    },
    {
      clientId: client1._id,
      title: 'Senior Node.js Developer for API integration',
      description: 'Need a backend expert to help us integrate multiple third-party APIs into our existing Node/Express backend. Strong AWS knowledge is a plus.',
      category: 'Development & IT',
      skills: ['Node.js', 'API Integration', 'AWS'],
      budget: 50,
      duration: 14,
      status: 'active',
    },
    {
      clientId: client2._id,
      title: 'Web3 / Smart Contract Developer',
      description: 'Building a new DeFi protocol and need experienced Solidity developers to help write and audit smart contracts.',
      category: 'Web3 & Blockchain',
      skills: ['Solidity', 'Blockchain', 'Web3.js'],
      budget: 4000,
      duration: 90,
      status: 'active',
    }
  ];

  const createdJobs = await Job.insertMany(jobs);

  // Generate feed events for job posts
  for (const job of createdJobs) {
    const owner = createdUsers.find(u => u._id.toString() === job.clientId.toString());
    await FeedPost.create({
      type: 'job_posted',
      actor: owner._id,
      actorName: `${owner.firstName} ${owner.lastName}`,
      actorAvatar: owner.profileImage,
      actorRole: owner.jobTitle,
      title: `New Job: ${job.title}`,
      body: job.description.length > 100 ? job.description.substring(0, 100) + '...' : job.description,
      emoji: '💼',
      relatedType: 'job',
      relatedId: job._id,
      targetAudience: 'all'
    });
  }

  // 3. Create Additional Feed Posts (Milestones, platform wins, etc)
  console.log('📣 Generating additional feed activities...');
  await FeedPost.create({
    type: 'project_completed',
    actor: freelancer1._id,
    actorName: `${freelancer1.firstName} ${freelancer1.lastName}`,
    actorAvatar: freelancer1.profileImage,
    actorRole: freelancer1.jobTitle,
    title: `Project Success: Mobile App Redesign`,
    body: 'Elena perfectly executed the mobile app design overhaul. The whole team is thrilled with the result!',
    emoji: '🏆',
    targetAudience: 'all'
  });

  await FeedPost.create({
    type: 'review_received',
    actor: freelancer2._id,
    actorName: `${freelancer2.firstName} ${freelancer2.lastName}`,
    actorAvatar: freelancer2.profileImage,
    actorRole: freelancer2.jobTitle,
    title: `5-Star Rating Received`,
    body: '"James delivered exactly what we needed ahead of schedule. Exceptional backend expertise!"',
    emoji: '⭐',
    targetAudience: 'all'
  });

  await FeedPost.create({
    type: 'platform_win',
    isSystemPost: true,
    title: `Connecta Milestone!`,
    body: 'We just passed 10,000 active projects completed on the platform! Huge thanks to our incredible community of clients and freelancers.',
    emoji: '🎉',
    targetAudience: 'all'
  });

  await FeedPost.create({
    type: 'community_poll',
    actor: client2._id,
    actorName: `${client2.firstName} ${client2.lastName}`,
    actorAvatar: client2.profileImage,
    title: `What's your favorite tech stack in 2026?`,
    body: 'Just curious what everyone is building with these days!',
    emoji: '📊',
    targetAudience: 'all',
    poll: {
      question: 'Favorite Stack?',
      options: [
        { text: 'MERN / NEXT.js', votes: [] },
        { text: 'Python / Django', votes: [] },
        { text: 'Ruby on Rails', votes: [] },
        { text: 'Rust / Go', votes: [] }
      ]
    }
  });

  console.log('\n🎉 Comprehensive database seed completed successfully!');
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('❌ Error during seeding:', err);
  process.exit(1);
});
