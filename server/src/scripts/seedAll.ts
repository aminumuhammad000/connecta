import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
import { Job } from '../models/Job.model.js';
import Proposal from '../models/Proposal.model.js';
import Wallet from '../models/Wallet.model.js';
import Transaction from '../models/Transaction.model.js';
import Message from '../models/Message.model.js';
import Conversation from '../models/Conversation.model.js';

dotenv.config();

const SAMPLE_CLIENTS = [
  {
    firstName: 'Amaka',
    lastName: 'Okonkwo',
    email: 'amaka@techpulse.ng',
    password: 'Password123!',
    userType: 'client',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    isVerified: true,
  },
  {
    firstName: 'Tunde',
    lastName: 'Bakare',
    email: 'tunde@payflow.ng',
    password: 'Password123!',
    userType: 'client',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    isVerified: true,
  },
];

const SAMPLE_JOBS = [
  {
    title: 'Full Stack React & Node.js Developer Needed',
    description: 'Looking for an experienced Full Stack Developer to build a high-performance web dashboard with real-time WebSocket notifications.',
    budget: 350000,
    duration: 14,
    category: 'Software Development',
    skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
    budgetType: 'fixed',
    company: 'TechPulse Africa',
    location: 'Lagos, Nigeria (Remote)',
    paymentVerified: true,
  },
  {
    title: 'UI/UX Designer for Mobile Banking App',
    description: 'Redesign our Android and iOS mobile banking app interface with modern glassmorphism, micro-interactions, and Figma design system.',
    budget: 250000,
    duration: 10,
    category: 'Design & Creative',
    skills: ['Figma', 'UI/UX Design', 'Prototyping', 'Mobile App Design'],
    budgetType: 'fixed',
    company: 'PayFlow Financial',
    location: 'Abuja, Nigeria (Remote)',
    paymentVerified: true,
  },
  {
    title: 'Senior Flutter Engineer - E-commerce App',
    description: 'We need a senior Flutter developer to integrate Paystack, Flutterwave escrow payment gateways, and optimize app performance.',
    budget: 500000,
    duration: 21,
    category: 'Software Development',
    skills: ['Flutter', 'Dart', 'Paystack', 'REST API'],
    budgetType: 'fixed',
    company: 'ShopMarket NG',
    location: 'Port Harcourt, Nigeria',
    paymentVerified: true,
  },
  {
    title: 'Python Data Scientist / Machine Learning Specialist',
    description: 'Build a predictive recommendation engine in Python using Pandas, Scikit-Learn, and OpenAI API for matching client jobs with freelancers.',
    budget: 400000,
    duration: 18,
    category: 'Data Science & AI',
    skills: ['Python', 'Machine Learning', 'Pandas', 'OpenAI API'],
    budgetType: 'fixed',
    company: 'DataCognition',
    location: 'Remote',
    paymentVerified: true,
  },
];

async function seedAllDatabaseData() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/connecta';
    console.log('Connecting to MongoDB...', mongoUri);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing test data...');
    await Job.deleteMany({});
    await Proposal.deleteMany({});
    await Transaction.deleteMany({});

    console.log('Seeding sample Clients...');
    const bcrypt = (await import('bcryptjs')).default;
    const defaultHash = await bcrypt.hash('Password123!', 10);
    const createdClients = [];
    for (const clientData of SAMPLE_CLIENTS) {
      let client = await User.findOne({ email: clientData.email });
      if (!client) {
        client = await User.create({ ...clientData, password: defaultHash });
      } else {
        client.password = defaultHash;
        await client.save();
      }
      createdClients.push(client);
    }

    const defaultClient = createdClients[0];

    console.log('Seeding 20 jobs linked to Clients...');
    const createdJobs = [];
    for (let i = 0; i < 20; i++) {
      const baseJob = SAMPLE_JOBS[i % SAMPLE_JOBS.length];
      const clientObj = createdClients[i % createdClients.length];
      const job = await Job.create({
        ...baseJob,
        title: i >= 4 ? `${baseJob.title} #${i + 1}` : baseJob.title,
        clientId: clientObj._id,
        status: 'active',
      });
      createdJobs.push(job);
    }

    // Seed sample freelancer user wallet, proposals, and chat conversations
    const freelancers = await User.find({ userType: 'freelancer' });
    console.log(`Found ${freelancers.length} Freelancers in database. Seeding wallet, proposals, and chat messages...`);

    for (const freelancer of freelancers) {
      // Update profile image if missing
      if (!freelancer.profileImage) {
        freelancer.profileImage = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80';
        (freelancer as any).title = 'Senior Full-Stack Engineer';
        (freelancer as any).bio = 'Building high-scale web and mobile platforms across Africa.';
        await freelancer.save();
      }

      // 1. Seed proposals for freelancer
      for (let j = 0; j < 3; j++) {
        const targetJob = createdJobs[j % createdJobs.length];
        const existingProposal = await Proposal.findOne({ jobId: targetJob._id, freelancerId: freelancer._id });
        if (!existingProposal) {
          await Proposal.create({
            jobId: targetJob._id,
            clientId: targetJob.clientId || defaultClient._id,
            freelancerId: freelancer._id,
            description: `Hello! I reviewed your project posting for "${targetJob.title}". With over 5 years of full-stack engineering experience, I can deliver this cleanly.`,
            price: targetJob.budget || 350000,
            deliveryTime: targetJob.duration || 14,
            status: j === 0 ? 'accepted' : 'pending',
          });
        }
      }

      // 2. Seed wallet for freelancer
      let wallet = await Wallet.findOne({ userId: freelancer._id });
      if (!wallet) {
        wallet = await Wallet.create({
          userId: freelancer._id,
          balance: 245000,
          escrowBalance: 350000,
          currency: 'NGN',
        });
      } else {
        wallet.balance = 245000;
        wallet.escrowBalance = 350000;
        await wallet.save();
      }

      // 3. Seed transactions for freelancer
      const txCount = await Transaction.countDocuments({ userId: freelancer._id });
      if (txCount === 0) {
        await Transaction.create({
          userId: freelancer._id,
          walletId: wallet._id,
          type: 'deposit',
          amount: 245000,
          status: 'completed',
          description: 'Milestone Released: PayFlow Mobile UI Design',
        });
        await Transaction.create({
          userId: freelancer._id,
          walletId: wallet._id,
          type: 'withdrawal',
          amount: 50000,
          status: 'completed',
          description: 'Bank Withdrawal to GTBank Account ****4910',
        });
      }

      // 4. Seed chat conversations & messages
      for (let k = 0; k < createdClients.length; k++) {
        const clientObj = createdClients[k];
        let conv = await Conversation.findOne({
          participants: { $all: [freelancer._id, clientObj._id] }
        });

        if (!conv) {
          conv = await Conversation.create({
            clientId: clientObj._id,
            freelancerId: freelancer._id,
            participants: [freelancer._id, clientObj._id],
            lastMessage: `Hi ${freelancer.firstName}, thanks for submitting your proposal! We would love to discuss project timeline details.`,
            lastMessageAt: new Date(),
          });
        }

        const msgCount = await Message.countDocuments({ conversationId: conv._id.toString() });
        if (msgCount === 0) {
          await Message.create({
            conversationId: conv._id.toString(),
            senderId: clientObj._id,
            receiverId: freelancer._id,
            text: `Hi ${freelancer.firstName}, thanks for submitting your proposal for our project! We reviewed your profile and portfolio.`,
            isRead: true,
          });

          await Message.create({
            conversationId: conv._id.toString(),
            senderId: freelancer._id,
            receiverId: clientObj._id,
            text: `Hello ${clientObj.firstName}! Thank you for reaching out. I'm excited to collaborate. When would be best to get started?`,
            isRead: true,
          });
        }
      }
    }

    console.log('✅ Seed completed successfully! All pages now have real database data.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seedAllDatabaseData();
