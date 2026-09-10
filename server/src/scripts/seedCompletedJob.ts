import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../models/user.model.js';
import { Job } from '../models/Job.model.js';
import Proposal from '../models/Proposal.model.js';
import Contract from '../models/Contract.model.js';
import Wallet from '../models/Wallet.model.js';
import Payment from '../models/Payment.model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/connecta';

async function seedCompletedJob() {
  console.log('🔗 Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB.');

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // 1. Create or Update Client User
  console.log('👤 Seeding Client Account...');
  let client = await User.findOne({ email: 'client@connecta.com' });
  if (!client) {
    client = await User.create({
      firstName: 'Sarah',
      lastName: 'Chen',
      email: 'client@connecta.com',
      password: hashedPassword,
      userType: 'client',
      isVerified: true,
      phoneNumber: '+14155552671',
      location: 'San Francisco, CA',
      country: 'United States',
      currency: 'USD',
      companyName: 'Apex Tech Solutions',
      title: 'Founder & Head of Product',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    });
  } else {
    client.password = hashedPassword;
    client.isVerified = true;
    client.userType = 'client';
    await client.save();
  }

  // 2. Create or Update Freelancer User
  console.log('👩‍💻 Seeding Freelancer Account...');
  let freelancer = await User.findOne({ email: 'freelancer@connecta.com' });
  if (!freelancer) {
    freelancer = await User.create({
      firstName: 'Zainab',
      lastName: 'Usman',
      email: 'freelancer@connecta.com',
      password: hashedPassword,
      userType: 'freelancer',
      isVerified: true,
      phoneNumber: '+2348031234567',
      location: 'Lagos, Nigeria',
      country: 'Nigeria',
      currency: 'USD',
      title: 'Senior Full-Stack & Mobile Engineer',
      bio: 'Expert in React, React Native, Node.js, and Escrow payment infrastructure with 6+ years of building enterprise scale web & mobile apps.',
      hourlyRate: 45,
      yearsOfExperience: 6,
      skills: ['React Native', 'Node.js', 'TypeScript', 'Escrow Payments', 'Tailwind CSS'],
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    });
  } else {
    freelancer.password = hashedPassword;
    freelancer.isVerified = true;
    freelancer.userType = 'freelancer';
    await freelancer.save();
  }

  // 3. Create Completed Job
  console.log('💼 Seeding Completed Job...');
  const jobTitle = 'E-Commerce Mobile App & Escrow Payment System';
  let job = await Job.findOne({ title: jobTitle, clientId: client._id });
  if (!job) {
    job = await Job.create({
      clientId: client._id,
      title: jobTitle,
      description: 'Build a high-performance cross-platform mobile shopping application with secure milestone escrow payments, live order tracking, real-time push notifications, and instant seller payouts.',
      category: 'Software Development',
      skills: ['React Native', 'Node.js', 'Escrow Payments', 'MongoDB'],
      budget: 2500,
      duration: 14,
      status: 'closed',
      paymentStatus: 'released',
      paymentVerified: true,
      hiredFreelancerId: freelancer._id,
    });
  } else {
    job.status = 'closed';
    job.paymentStatus = 'released';
    job.paymentVerified = true;
    (job as any).hiredFreelancerId = freelancer._id;
    await job.save();
  }

  // 4. Create Accepted Proposal
  console.log('📝 Seeding Proposal...');
  let proposal = await Proposal.findOne({ jobId: job._id, freelancerId: freelancer._id });
  if (!proposal) {
    proposal = await Proposal.create({
      jobId: job._id,
      freelancerId: freelancer._id,
      clientId: client._id,
      description: 'I am excited to build your E-Commerce mobile application with integrated escrow payments. I have built 10+ similar high-throughput fintech and marketplace mobile applications with 100% test coverage.',
      price: 2500,
      deliveryTime: 14,
      status: 'accepted',
    });
  } else {
    proposal.status = 'accepted';
    await proposal.save();
  }

  // 5. Create Completed Contract
  console.log('📜 Seeding Completed Contract...');
  let contract = await Contract.findOne({ jobId: job._id, clientId: client._id });
  if (!contract) {
    contract = await Contract.create({
      jobId: job._id,
      clientId: client._id,
      freelancerId: freelancer._id,
      proposalId: proposal._id,
      title: jobTitle,
      description: 'Complete cross-platform React Native app with Node.js backend and Connecta Escrow integration.',
      totalPrice: 2500,
      deliveryTime: 14,
      contractType: 'milestone_gig',
      currency: 'USD',
      status: 'completed',
      paymentStatus: 'released',
      submission: {
        summary: 'All iOS and Android app builds, REST API backend source code, database schemas, and unit test suite have been completed and verified.',
        files: [
          'https://github.com/apextech/ecommerce-app-build.zip',
          'https://connecta.app/deliverables/ecom-mobile-production-v1.0.apk'
        ],
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      }
    });
  } else {
    contract.status = 'completed';
    contract.paymentStatus = 'released';
    await contract.save();
  }

  // 5b. Create Active Contracts for All Users in DB
  console.log('📜 Seeding Active Contracts for All Registered Users...');
  const activeJobTitle = 'Senior Mobile App Engineer (React Native & Node.js)';
  let activeJob = await Job.findOne({ title: activeJobTitle });
  if (!activeJob) {
    activeJob = await Job.create({
      clientId: client._id,
      title: activeJobTitle,
      description: 'Developing high-throughput fintech and marketplace mobile application with live order tracking and instant seller payouts.',
      category: 'Software Development',
      skills: ['React Native', 'TypeScript', 'Node.js'],
      budget: 450000,
      duration: 30,
      status: 'active',
      paymentStatus: 'escrow',
      hiredFreelancerId: freelancer._id,
    });
  }

  const allUsers = await User.find({});
  for (const usr of allUsers) {
    const userActiveContract = await Contract.findOne({
      $or: [{ freelancerId: usr._id }, { clientId: usr._id }],
      status: 'active'
    });

    if (!userActiveContract) {
      await Contract.create({
        jobId: activeJob._id,
        clientId: client._id,
        freelancerId: usr._id,
        proposalId: proposal._id,
        title: 'Senior Mobile App Engineer (React Native & Node.js)',
        description: 'Developing high-throughput fintech and marketplace mobile application with live order tracking and instant seller payouts.',
        totalPrice: 450000,
        deliveryTime: 30,
        contractType: 'full_time_contract',
        currency: 'NGN',
        status: 'active',
        paymentStatus: 'escrow',
      });
    }

    const userCompletedContract = await Contract.findOne({
      $or: [{ freelancerId: usr._id }, { clientId: usr._id }],
      status: 'completed'
    });

    if (!userCompletedContract) {
      await Contract.create({
        jobId: job._id,
        clientId: client._id,
        freelancerId: usr._id,
        proposalId: proposal._id,
        title: jobTitle,
        description: 'Complete cross-platform React Native app with Node.js backend and Connecta Escrow integration.',
        totalPrice: 2500,
        deliveryTime: 14,
        contractType: 'milestone_gig',
        currency: 'USD',
        status: 'completed',
        paymentStatus: 'released',
        submission: {
          summary: 'All iOS and Android app builds, REST API backend source code, database schemas, and unit test suite have been completed and verified.',
          files: [
            'https://github.com/apextech/ecommerce-app-build.zip',
            'https://connecta.app/deliverables/ecom-mobile-production-v1.0.apk'
          ],
          submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        }
      });
    }
  }

  // 6. Create / Update Payment Record & Wallets
  console.log('💰 Updating Escrow Payment & Wallet Balances...');
  let payment = await Payment.findOne({ jobId: job._id, payeeId: freelancer._id });
  if (!payment) {
    await Payment.create({
      payerId: client._id,
      payeeId: freelancer._id,
      jobId: job._id,
      projectId: contract._id,
      amount: 2500,
      platformFee: 125,
      netAmount: 2375,
      currency: 'USD',
      status: 'completed',
      escrowStatus: 'released',
      paymentMethod: 'wallet',
      paymentType: 'project_payment',
      gatewayReference: `REF_SEED_${Date.now()}`,
      releasedAt: new Date(),
      paidAt: new Date(),
      description: `Escrow payout for completed contract: ${jobTitle}`
    });
  } else {
    payment.status = 'completed';
    payment.escrowStatus = 'released';
    payment.releasedAt = new Date();
    await payment.save();
  }

  // Update Freelancer Wallet
  let freelancerWallet = await Wallet.findOne({ userId: freelancer._id });
  if (!freelancerWallet) {
    await Wallet.create({
      userId: freelancer._id,
      balance: 2500,
      escrowBalance: 0,
      totalEarnings: 2500,
      currency: 'USD',
    });
  } else {
    freelancerWallet.balance = 2500;
    freelancerWallet.escrowBalance = 0;
    freelancerWallet.totalEarnings = 2500;
    await freelancerWallet.save();
  }

  console.log('====================================================');
  console.log('🎉 COMPLETED JOB SEEDED SUCCESSFULLY!');
  console.log('====================================================');
  console.log('🔑 CLIENT CREDENTIALS:');
  console.log('   Email: client@connecta.com');
  console.log('   Password: Password123!');
  console.log('   Role: Client');
  console.log('----------------------------------------------------');
  console.log('🔑 FREELANCER CREDENTIALS:');
  console.log('   Email: freelancer@connecta.com');
  console.log('   Password: Password123!');
  console.log('   Role: Freelancer');
  console.log('----------------------------------------------------');
  console.log('📦 SEEDED COMPLETED CONTRACT DETAILS:');
  console.log(`   Job Title: ${jobTitle}`);
  console.log(`   Contract ID: ${contract._id}`);
  console.log(`   Contract Status: completed`);
  console.log(`   Payment Status: released ($2,500 USD)`);
  console.log('====================================================');

  await mongoose.disconnect();
}

seedCompletedJob().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
