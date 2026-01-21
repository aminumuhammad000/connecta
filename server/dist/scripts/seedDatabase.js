import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
// Load environment variables
dotenv.config();
// Import all models
import User from '../models/user.model';
import Profile from '../models/Profile.model';
import Job from '../models/Job.model';
import Project from '../models/Project.model';
import Proposal from '../models/Proposal.model';
import Contract from '../models/Contract.model';
import Payment from '../models/Payment.model';
import Review from '../models/Review.model';
import Notification from '../models/Notification.model';
import Subscription from '../models/subscription.model';
import Wallet from '../models/Wallet.model';
import Transaction from '../models/Transaction.model';
import Withdrawal from '../models/Withdrawal.model';
import Conversation from '../models/Conversation.model';
import Message from '../models/Message.model';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/connecta';
// Seed data
const seedData = {
    users: [
        {
            email: 'admin@connecta.com',
            password: 'Admin@123456',
            firstName: 'Admin',
            lastName: 'User',
            userType: 'admin',
            phoneNumber: '+2348012345678',
            isVerified: true,
            isPremium: false,
        },
        {
            email: 'john.doe@example.com',
            password: 'Password123!',
            firstName: 'John',
            lastName: 'Doe',
            userType: 'freelancer',
            phoneNumber: '+2348023456789',
            isVerified: true,
            isPremium: true,
        },
        {
            email: 'jane.smith@example.com',
            password: 'Password123!',
            firstName: 'Jane',
            lastName: 'Smith',
            userType: 'client',
            phoneNumber: '+2348034567890',
            isVerified: true,
            isPremium: false,
        },
        {
            email: 'mike.wilson@example.com',
            password: 'Password123!',
            firstName: 'Mike',
            lastName: 'Wilson',
            userType: 'freelancer',
            phoneNumber: '+2348045678901',
            isVerified: true,
            isPremium: true,
        },
        {
            email: 'sarah.johnson@example.com',
            password: 'Password123!',
            firstName: 'Sarah',
            lastName: 'Johnson',
            userType: 'client',
            phoneNumber: '+2348056789012',
            isVerified: true,
            isPremium: true,
        },
        {
            email: 'david.brown@example.com',
            password: 'Password123!',
            firstName: 'David',
            lastName: 'Brown',
            userType: 'freelancer',
            phoneNumber: '+2348067890123',
            isVerified: true,
            isPremium: false,
        },
        {
            email: 'emily.davis@example.com',
            password: 'Password123!',
            firstName: 'Emily',
            lastName: 'Davis',
            userType: 'client',
            phoneNumber: '+2348078901234',
            isVerified: true,
            isPremium: false,
        },
        {
            email: 'alex.taylor@example.com',
            password: 'Password123!',
            firstName: 'Alex',
            lastName: 'Taylor',
            userType: 'freelancer',
            phoneNumber: '+2348089012345',
            isVerified: true,
            isPremium: true,
        },
        {
            email: 'lisa.anderson@example.com',
            password: 'Password123!',
            firstName: 'Lisa',
            lastName: 'Anderson',
            userType: 'client',
            phoneNumber: '+2348090123456',
            isVerified: true,
            isPremium: true,
        },
        {
            email: 'chris.martinez@example.com',
            password: 'Password123!',
            firstName: 'Chris',
            lastName: 'Martinez',
            userType: 'freelancer',
            phoneNumber: '+2348091234567',
            isVerified: true,
            isPremium: false,
        },
    ],
};
const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...\n');
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');
        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Profile.deleteMany({});
        await Job.deleteMany({});
        await Project.deleteMany({});
        await Proposal.deleteMany({});
        await Contract.deleteMany({});
        await Payment.deleteMany({});
        await Review.deleteMany({});
        await Notification.deleteMany({});
        await Subscription.deleteMany({});
        await Wallet.deleteMany({});
        await Transaction.deleteMany({});
        await Withdrawal.deleteMany({});
        await Conversation.deleteMany({});
        await Message.deleteMany({});
        console.log('✅ Cleared all collections\n');
        // ==========================
        // 1. Seed Users
        // ==========================
        console.log('👥 Seeding users...');
        const hashedUsers = await Promise.all(seedData.users.map(async (user) => ({
            ...user,
            password: await bcrypt.hash(user.password, 10),
        })));
        const users = await User.insertMany(hashedUsers);
        console.log(`✅ Created ${users.length} users\n`);
        // Get specific users for relationships
        const admin = users.find((u) => u.userType === 'admin');
        const freelancers = users.filter((u) => u.userType === 'freelancer');
        const clients = users.filter((u) => u.userType === 'client');
        // ==========================
        // 2. Seed Profiles
        // ==========================
        console.log('📝 Seeding profiles...');
        const profilesData = freelancers.map((freelancer, index) => ({
            user: freelancer._id,
            phoneNumber: freelancer.phoneNumber,
            location: ['Lagos, Nigeria', 'Abuja, Nigeria', 'Port Harcourt, Nigeria'][index % 3],
            skills: [
                ['JavaScript', 'React', 'Node.js', 'MongoDB'],
                ['React Native', 'Flutter', 'iOS', 'Android'],
                ['Figma', 'Adobe XD', 'Sketch', 'UI Design'],
                ['Python', 'Django', 'PostgreSQL', 'Docker'],
                ['Java', 'Spring Boot', 'MySQL', 'AWS'],
            ][index % 5],
            education: [
                {
                    institution: ['University of Lagos', 'University of Abuja', 'University of Port Harcourt'][index % 3],
                    degree: ['Bachelor', 'Master'][index % 2],
                    fieldOfStudy: 'Computer Science',
                    description: `Completed ${['Bachelor', 'Master'][index % 2]} degree with focus on software engineering`,
                    startDate: new Date(2015 + index, 8, 1),
                    endDate: new Date(2019 + index, 5, 30),
                },
            ],
            languages: [
                {
                    language: 'English',
                    proficiency: 'fluent',
                },
            ],
            employment: [
                {
                    company: ['Tech Corp', 'Digital Solutions', 'Web Agency'][index % 3],
                    position: ['Senior Developer', 'Lead Developer', 'Full Stack Developer'][index % 3],
                    startDate: new Date(2020 + index, 0, 1),
                    description: `Working as ${['Senior Developer', 'Lead Developer', 'Full Stack Developer'][index % 3]}`,
                },
            ],
        }));
        const profiles = await Profile.insertMany(profilesData);
        console.log(`✅ Created ${profiles.length} profiles\n`);
        // ==========================
        // 3. Seed Wallets
        // ==========================
        console.log('💰 Seeding wallets...');
        const walletsData = users.map((user, index) => ({
            userId: user._id,
            balance: index * 5000,
            currency: 'NGN',
        }));
        const wallets = await Wallet.insertMany(walletsData);
        console.log(`✅ Created ${wallets.length} wallets\n`);
        // ==========================
        // 4. Seed Jobs
        // ==========================
        console.log('💼 Seeding jobs...');
        const jobTitles = [
            'Build E-commerce Website',
            'Mobile App Development',
            'Logo Design for Startup',
            'Backend API Development',
            'UI/UX Design for SaaS Platform',
            'WordPress Website Development',
        ];
        const categories = ['Web Development', 'Mobile Development', 'Design', 'Backend', 'UI/UX', 'CMS'];
        const skillSets = [
            ['HTML', 'CSS', 'JavaScript', 'React'],
            ['React Native', 'Flutter'],
            ['Adobe Illustrator', 'Photoshop'],
            ['Node.js', 'Express', 'MongoDB'],
            ['Figma', 'Sketch'],
            ['WordPress', 'PHP'],
        ];
        const jobsData = clients.flatMap((client, clientIndex) => Array.from({ length: 2 }, (_, jobIndex) => {
            const index = clientIndex * 2 + jobIndex;
            return {
                clientId: client._id,
                title: jobTitles[index % jobTitles.length],
                company: `${client.firstName} ${client.lastName} Company`,
                location: ['Lagos, Nigeria', 'Remote', 'Abuja, Nigeria'][clientIndex % 3],
                locationType: ['remote', 'onsite', 'hybrid'][jobIndex % 3],
                jobType: ['full-time', 'part-time', 'contract', 'freelance'][jobIndex % 4],
                description: `Detailed description for job ${index + 1}. We need an experienced professional to deliver high-quality work. This is a great opportunity to work on exciting projects.`,
                summary: `Short summary for job ${index + 1}`,
                requirements: [
                    `${3 + jobIndex} years of experience`,
                    'Strong portfolio',
                    'Excellent communication skills',
                ],
                category: categories[index % categories.length],
                skills: skillSets[index % skillSets.length],
                experience: ['Entry Level', 'Intermediate', 'Expert'][jobIndex % 3],
                budget: `₦${50000 + clientIndex * 10000}`,
                budgetType: jobIndex % 2 === 0 ? 'fixed' : 'hourly',
                salary: {
                    min: 50000 + clientIndex * 10000,
                    max: 100000 + clientIndex * 20000,
                    currency: 'NGN',
                },
                status: ['active', 'closed', 'draft'][jobIndex % 3],
                applicants: jobIndex + 1,
                posted: new Date(Date.now() - (7 + jobIndex) * 24 * 60 * 60 * 1000),
                deadline: new Date(Date.now() + (30 - jobIndex * 5) * 24 * 60 * 60 * 1000),
                connectsRequired: `${2 + jobIndex}`,
                deliverables: ['Complete source code', 'Documentation', 'Deployment support'],
                postedTime: `${7 + jobIndex} days ago`,
                paymentVerified: jobIndex % 2 === 0,
            };
        }));
        const jobs = await Job.insertMany(jobsData);
        console.log(`✅ Created ${jobs.length} jobs\n`);
        // ==========================
        // 5. Seed Proposals
        // ==========================
        console.log('📋 Seeding proposals...');
        const proposalsData = jobs.flatMap((job, jobIndex) => freelancers.slice(0, 2).map((freelancer, freelancerIndex) => ({
            jobId: job._id,
            clientId: job.clientId,
            freelancerId: freelancer._id,
            title: `Proposal for ${job.title}`,
            description: `I am very interested in this project. I have ${3 + freelancerIndex} years of experience in this field and can deliver high-quality work within the specified timeframe. I have worked on similar projects and understand the requirements well.`,
            coverLetter: `Dear Client, I am excited to submit my proposal for your project. With my expertise and dedication, I am confident I can exceed your expectations.`,
            budget: {
                amount: 30000 + freelancerIndex * 5000,
                currency: '₦',
            },
            dateRange: {
                startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + (30 + freelancerIndex * 14) * 24 * 60 * 60 * 1000),
            },
            type: freelancerIndex % 2 === 0 ? 'recommendation' : 'referral',
            status: ['pending', 'accepted', 'declined'][freelancerIndex % 3],
            level: ['entry', 'intermediate', 'expert'][freelancerIndex % 3],
            priceType: freelancerIndex % 2 === 0 ? 'fixed' : 'hourly',
            recommended: freelancerIndex === 0,
            views: freelancerIndex + 1,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })));
        const proposals = await Proposal.insertMany(proposalsData);
        console.log(`✅ Created ${proposals.length} proposals\n`);
        // ==========================
        // 6. Seed Projects
        // ==========================
        console.log('🚀 Seeding projects...');
        const acceptedProposals = proposals.filter((p) => p.status === 'accepted');
        const projectsData = acceptedProposals.map((proposal, index) => {
            const job = jobs.find((j) => j._id.toString() === proposal.jobId.toString());
            return {
                jobId: job._id,
                clientId: proposal.clientId,
                clientName: `Client ${index + 1}`,
                clientVerified: true,
                freelancerId: proposal.freelancerId,
                title: proposal.title.replace('Proposal for ', ''),
                description: proposal.description,
                summary: `Project summary for ${proposal.title}`,
                status: ['ongoing', 'completed', 'cancelled'][index % 3],
                statusLabel: ['Active', 'Completed', 'Cancelled'][index % 3],
                budget: {
                    amount: proposal.budget.amount,
                    currency: proposal.budget.currency,
                    type: proposal.priceType,
                },
                projectType: job.category,
                dateRange: {
                    startDate: proposal.dateRange.startDate,
                    endDate: proposal.dateRange.endDate,
                },
                deliverables: job.deliverables || [],
                activity: [
                    {
                        date: new Date(),
                        description: 'Project started',
                    },
                ],
                milestones: [
                    {
                        title: 'Initial Phase',
                        status: 'completed',
                        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        amount: proposal.budget.amount * 0.3,
                    },
                    {
                        title: 'Development Phase',
                        status: 'in-progress',
                        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
                        amount: proposal.budget.amount * 0.5,
                    },
                    {
                        title: 'Final Delivery',
                        status: 'pending',
                        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                        amount: proposal.budget.amount * 0.2,
                    },
                ],
                uploads: [],
            };
        });
        const projects = await Project.insertMany(projectsData);
        console.log(`✅ Created ${projects.length} projects\n`);
        // ==========================
        // 7. Seed Contracts
        // ==========================
        console.log('📄 Seeding contracts...');
        const contractsData = projects.map((project, index) => ({
            projectId: project._id,
            clientId: project.clientId,
            freelancerId: project.freelancerId,
            title: `Contract for ${project.title}`,
            description: `This is a legally binding contract for the project: ${project.title}. Both parties agree to the terms and conditions outlined in this document.`,
            contractType: project.budget.type === 'fixed' ? 'fixed_price' : 'hourly',
            terms: [
                {
                    title: 'Scope of Work',
                    description: 'Description of work to be completed',
                    order: 1,
                },
                {
                    title: 'Payment Terms',
                    description: 'Payment schedule and conditions',
                    order: 2,
                },
            ],
            budget: {
                amount: project.budget.amount,
                currency: project.budget.currency,
                paymentSchedule: 'Upon completion of milestones',
            },
            startDate: project.dateRange.startDate,
            endDate: project.dateRange.endDate,
            deliverables: project.deliverables || [],
            status: ['draft', 'pending_signatures', 'active'][index % 3],
            clientSignature: index % 3 === 2 ? {
                userId: project.clientId,
                userName: project.clientName,
                signedAt: new Date(),
                ipAddress: '192.168.1.1',
            } : undefined,
            freelancerSignature: index % 3 === 2 ? {
                userId: project.freelancerId,
                userName: 'Freelancer',
                signedAt: new Date(),
                ipAddress: '192.168.1.2',
            } : undefined,
        }));
        const contracts = await Contract.insertMany(contractsData);
        console.log(`✅ Created ${contracts.length} contracts\n`);
        // ==========================
        // 8. Seed Payments
        // ==========================
        console.log('💳 Seeding payments...');
        const paymentsData = projects.map((project, index) => ({
            projectId: project._id,
            payerId: project.clientId,
            payeeId: project.freelancerId,
            amount: project.budget.amount * 0.3,
            currency: 'NGN',
            platformFee: project.budget.amount * 0.3 * 0.05,
            netAmount: project.budget.amount * 0.3 * 0.95,
            status: ['pending', 'completed', 'failed'][index % 3],
            paymentMethod: 'paystack',
            paymentType: 'milestone',
            gatewayReference: `PAY-${Date.now()}-${index}`,
            escrowStatus: ['held', 'released', 'none'][index % 3],
            description: `Milestone payment for ${project.title}`,
            paidAt: index % 3 === 1 ? new Date() : undefined,
            releasedAt: index % 3 === 1 ? new Date() : undefined,
        }));
        const payments = await Payment.insertMany(paymentsData);
        console.log(`✅ Created ${payments.length} payments\n`);
        // ==========================
        // 9. Seed Transactions
        // ==========================
        console.log('🔄 Seeding transactions...');
        const transactionsData = payments.flatMap((payment, index) => [
            {
                userId: payment.payerId,
                type: 'payment_sent',
                amount: payment.amount,
                currency: 'NGN',
                status: payment.status,
                paymentId: payment._id,
                projectId: payment.projectId,
                balanceBefore: 100000,
                balanceAfter: 100000 - payment.amount,
                description: `Payment sent for project`,
                gatewayReference: payment.gatewayReference,
            },
            {
                userId: payment.payeeId,
                type: 'payment_received',
                amount: payment.netAmount,
                currency: 'NGN',
                status: payment.status,
                paymentId: payment._id,
                projectId: payment.projectId,
                balanceBefore: 0,
                balanceAfter: payment.netAmount,
                description: `Payment received for project`,
                gatewayReference: payment.gatewayReference,
            },
        ]);
        const transactions = await Transaction.insertMany(transactionsData);
        console.log(`✅ Created ${transactions.length} transactions\n`);
        // ==========================
        // 10. Seed Reviews
        // ==========================
        console.log('⭐ Seeding reviews...');
        const completedProjects = projects.filter((p) => p.status === 'completed');
        const reviewsData = completedProjects.flatMap((project) => [
            {
                projectId: project._id,
                reviewerId: project.clientId,
                revieweeId: project.freelancerId,
                reviewerType: 'client',
                rating: 4 + Math.random(),
                comment: 'Great work! Very professional and delivered on time.',
                isPublic: true,
            },
            {
                projectId: project._id,
                reviewerId: project.freelancerId,
                revieweeId: project.clientId,
                reviewerType: 'freelancer',
                rating: 4.5 + Math.random() * 0.5,
                comment: 'Excellent client! Clear requirements and timely payments.',
                isPublic: true,
            },
        ]);
        const reviews = await Review.insertMany(reviewsData);
        console.log(`✅ Created ${reviews.length} reviews\n`);
        // ==========================
        // 11. Seed Subscriptions
        // ==========================
        console.log('💎 Seeding subscriptions...');
        const premiumUsers = users.filter((u) => u.isPremium);
        const subscriptionsData = premiumUsers.map((user, index) => ({
            userId: user._id,
            plan: 'premium',
            amount: 5000,
            currency: 'NGN',
            status: ['active', 'expired', 'cancelled'][index % 3],
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + (index % 3 === 0 ? 30 : -1) * 24 * 60 * 60 * 1000),
            paymentReference: `SUB-${Date.now()}-${index}`,
            autoRenew: index % 2 === 0,
        }));
        const subscriptions = await Subscription.insertMany(subscriptionsData);
        console.log(`✅ Created ${subscriptions.length} subscriptions\n`);
        // ==========================
        // 12. Seed Notifications
        // ==========================
        console.log('🔔 Seeding notifications...');
        const notificationTypes = [
            'proposal_received',
            'proposal_accepted',
            'project_started',
            'payment_received',
            'message_received',
            'review_received',
        ];
        const notificationsData = users.flatMap((user, userIndex) => Array.from({ length: 2 }, (_, notifIndex) => ({
            userId: user._id,
            type: notificationTypes[notifIndex % notificationTypes.length],
            title: [
                'New Proposal Received',
                'Proposal Accepted',
                'Project Started',
                'Payment Received',
                'New Message',
                'Review Received',
            ][notifIndex % 6],
            message: `You have a new notification. Please check your dashboard for details.`,
            relatedType: ['proposal', 'proposal', 'project', 'payment', 'message', 'review'][notifIndex % 6],
            icon: ['📋', '✅', '🚀', '💰', '💬', '⭐'][notifIndex % 6],
            priority: ['low', 'medium', 'high'][notifIndex % 3],
            isRead: notifIndex % 2 === 0,
            link: `/dashboard/${['proposals', 'proposals', 'projects', 'payments', 'messages', 'reviews'][notifIndex % 6]}`,
        })));
        const notifications = await Notification.insertMany(notificationsData);
        console.log(`✅ Created ${notifications.length} notifications\n`);
        // ==========================
        // 13. Seed Conversations
        // ==========================
        console.log('💬 Seeding conversations...');
        const conversationsData = projects.map((project) => ({
            clientId: project.clientId,
            freelancerId: project.freelancerId,
            projectId: project._id,
            lastMessage: 'Hi, I have a question about the project.',
            lastMessageAt: new Date(),
            unreadCount: {
                [project.clientId.toString()]: 0,
                [project.freelancerId.toString()]: 1,
            },
        }));
        const conversations = await Conversation.insertMany(conversationsData);
        console.log(`✅ Created ${conversations.length} conversations\n`);
        // ==========================
        // 14. Seed Messages
        // ==========================
        console.log('✉️  Seeding messages...');
        const messagesData = conversations.flatMap((conversation, index) => [
            {
                conversationId: conversation._id.toString(),
                senderId: conversation.clientId,
                receiverId: conversation.freelancerId,
                text: 'Hi! I wanted to discuss the project requirements.',
                isRead: true,
            },
            {
                conversationId: conversation._id.toString(),
                senderId: conversation.freelancerId,
                receiverId: conversation.clientId,
                text: 'Sure! I am available to discuss. What would you like to know?',
                isRead: index % 2 === 0,
            },
            {
                conversationId: conversation._id.toString(),
                senderId: conversation.clientId,
                receiverId: conversation.freelancerId,
                text: 'When can you start working on this?',
                isRead: false,
            },
        ]);
        const messages = await Message.insertMany(messagesData);
        console.log(`✅ Created ${messages.length} messages\n`);
        // ==========================
        // 15. Seed Withdrawals
        // ==========================
        console.log('🏦 Seeding withdrawals...');
        const withdrawalsData = freelancers.slice(0, 3).map((freelancer, index) => {
            const amount = 20000 + index * 5000;
            const processingFee = amount * 0.015; // 1.5% fee
            const netAmount = amount - processingFee;
            return {
                userId: freelancer._id,
                amount,
                currency: 'NGN',
                processingFee,
                netAmount,
                bankDetails: {
                    accountName: `${freelancer.firstName} ${freelancer.lastName}`,
                    accountNumber: `12345678${index}`,
                    bankName: ['GTBank', 'Access Bank', 'First Bank'][index % 3],
                    bankCode: ['058', '044', '011'][index % 3],
                },
                status: ['pending', 'processing', 'completed'][index % 3],
            };
        });
        const withdrawals = await Withdrawal.insertMany(withdrawalsData);
        console.log(`✅ Created ${withdrawals.length} withdrawals\n`);
        // ==========================
        // Summary
        // ==========================
        console.log('\n🎉 Database seeding completed successfully!\n');
        console.log('📊 Summary:');
        console.log(`   • Users: ${users.length}`);
        console.log(`   • Profiles: ${profiles.length}`);
        console.log(`   • Wallets: ${wallets.length}`);
        console.log(`   • Jobs: ${jobs.length}`);
        console.log(`   • Proposals: ${proposals.length}`);
        console.log(`   • Projects: ${projects.length}`);
        console.log(`   • Contracts: ${contracts.length}`);
        console.log(`   • Payments: ${payments.length}`);
        console.log(`   • Transactions: ${transactions.length}`);
        console.log(`   • Reviews: ${reviews.length}`);
        console.log(`   • Subscriptions: ${subscriptions.length}`);
        console.log(`   • Notifications: ${notifications.length}`);
        console.log(`   • Conversations: ${conversations.length}`);
        console.log(`   • Messages: ${messages.length}`);
        console.log(`   • Withdrawals: ${withdrawals.length}`);
        console.log('\n✅ All data has been seeded successfully!');
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB\n');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error seeding database:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
};
// Run the seed function
seedDatabase();
