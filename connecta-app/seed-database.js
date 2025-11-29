/**
 * Database Seeding Script for Connecta Backend
 * 
 * This script seeds the database with comprehensive mock data for testing
 * Run this script on your backend server
 * 
 * Usage: node seed-database.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB Connection String - UPDATE THIS WITH YOUR ACTUAL CONNECTION STRING
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/connecta';

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Connected to MongoDB');
}).catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

// Define Schemas (adjust based on your actual models)
const UserSchema = new mongoose.Schema({
    email: String,
    password: String,
    fullName: String,
    userType: String,
    phoneNumber: String,
    isEmailVerified: Boolean,
    createdAt: { type: Date, default: Date.now }
});

const ProfileSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    bio: String,
    location: String,
    avatar: String,
    skills: [String],
    hourlyRate: Number,
    rating: Number,
    totalReviews: Number,
    completedProjects: Number,
    website: String,
    portfolio: [Object]
});

const JobSchema = new mongoose.Schema({
    clientId: mongoose.Schema.Types.ObjectId,
    title: String,
    description: String,
    budget: Number,
    duration: String,
    skills: [String],
    status: String,
    category: String,
    jobType: String,
    proposalsCount: { type: Number, default: 0 },
    postedAt: { type: Date, default: Date.now }
});

const ProposalSchema = new mongoose.Schema({
    jobId: mongoose.Schema.Types.ObjectId,
    freelancerId: mongoose.Schema.Types.ObjectId,
    coverLetter: String,
    proposedAmount: Number,
    estimatedDuration: String,
    status: String,
    submittedAt: { type: Date, default: Date.now }
});

const ProjectSchema = new mongoose.Schema({
    jobId: mongoose.Schema.Types.ObjectId,
    clientId: mongoose.Schema.Types.ObjectId,
    freelancerId: mongoose.Schema.Types.ObjectId,
    title: String,
    description: String,
    budget: Number,
    status: String,
    progress: Number,
    startDate: Date,
    dueDate: Date,
    createdAt: { type: Date, default: Date.now }
});

const ConversationSchema = new mongoose.Schema({
    participants: [mongoose.Schema.Types.ObjectId],
    lastMessage: String,
    lastMessageAt: Date,
    createdAt: { type: Date, default: Date.now }
});

const MessageSchema = new mongoose.Schema({
    conversationId: mongoose.Schema.Types.ObjectId,
    senderId: mongoose.Schema.Types.ObjectId,
    receiverId: mongoose.Schema.Types.ObjectId,
    content: String,
    isRead: Boolean,
    sentAt: { type: Date, default: Date.now }
});

const WalletSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    balance: Number,
    currency: String,
    createdAt: { type: Date, default: Date.now }
});

const TransactionSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    type: String,
    amount: Number,
    description: String,
    status: String,
    reference: String,
    createdAt: { type: Date, default: Date.now }
});

const NotificationSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    type: String,
    title: String,
    message: String,
    isRead: Boolean,
    link: String,
    createdAt: { type: Date, default: Date.now }
});

const ReviewSchema = new mongoose.Schema({
    reviewerId: mongoose.Schema.Types.ObjectId,
    revieweeId: mongoose.Schema.Types.ObjectId,
    projectId: mongoose.Schema.Types.ObjectId,
    rating: Number,
    comment: String,
    createdAt: { type: Date, default: Date.now }
});

const ContractSchema = new mongoose.Schema({
    projectId: mongoose.Schema.Types.ObjectId,
    clientId: mongoose.Schema.Types.ObjectId,
    freelancerId: mongoose.Schema.Types.ObjectId,
    terms: String,
    amount: Number,
    status: String,
    clientSigned: Boolean,
    freelancerSigned: Boolean,
    createdAt: { type: Date, default: Date.now }
});

// Create Models
const User = mongoose.model('User', UserSchema);
const Profile = mongoose.model('Profile', ProfileSchema);
const Job = mongoose.model('Job', JobSchema);
const Proposal = mongoose.model('Proposal', ProposalSchema);
const Project = mongoose.model('Project', ProjectSchema);
const Conversation = mongoose.model('Conversation', ConversationSchema);
const Message = mongoose.model('Message', MessageSchema);
const Wallet = mongoose.model('Wallet', WalletSchema);
const Transaction = mongoose.model('Transaction', TransactionSchema);
const Notification = mongoose.model('Notification', NotificationSchema);
const Review = mongoose.model('Review', ReviewSchema);
const Contract = mongoose.model('Contract', ContractSchema);

// Seed Data
const seedDatabase = async () => {
    try {
        console.log('🔄 Clearing existing data...');
        await User.deleteMany({});
        await Profile.deleteMany({});
        await Job.deleteMany({});
        await Proposal.deleteMany({});
        await Project.deleteMany({});
        await Conversation.deleteMany({});
        await Message.deleteMany({});
        await Wallet.deleteMany({});
        await Transaction.deleteMany({});
        await Notification.deleteMany({});
        await Review.deleteMany({});
        await Contract.deleteMany({});

        console.log('👤 Creating client user...');
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        // 1. Create Client User (uteach38@gmail.com)
        const clientUser = await User.create({
            email: 'uteach38@gmail.com',
            password: hashedPassword,
            fullName: 'John Doe',
            userType: 'client',
            phoneNumber: '+2348012345678',
            isEmailVerified: true,
            createdAt: new Date()
        });

        console.log('✅ Client user created:', clientUser.email);

        // 2. Create Client Profile
        await Profile.create({
            userId: clientUser._id,
            bio: 'Experienced project manager and entrepreneur looking for talented freelancers to bring my ideas to life.',
            location: 'Lagos, Nigeria',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=client',
            rating: 4.8,
            totalReviews: 45,
            completedProjects: 23,
            website: 'https://johndoe.com'
        });

        console.log('👥 Creating freelancers...');
        // 3. Create Freelancers
        const freelancers = [];
        const freelancerNames = [
            'Sarah Johnson', 'Michael Chen', 'Amina Ibrahim', 'David Okafor',
            'Fatima Bello', 'Emmanuel Eze', 'Grace Adeleke', 'Ibrahim Musa',
            'Chioma Nwosu', 'Ahmed Abdullahi'
        ];
        
        const skillSets = [
            ['JavaScript', 'React', 'Node.js', 'MongoDB'],
            ['Python', 'Django', 'Machine Learning', 'Data Analysis'],
            ['Figma', 'Photoshop', 'Illustrator', 'UI/UX Design'],
            ['Content Writing', 'SEO', 'Copywriting', 'Technical Writing'],
            ['Digital Marketing', 'Social Media', 'Analytics', 'Facebook Ads'],
            ['React Native', 'Flutter', 'Mobile Development', 'Firebase'],
            ['WordPress', 'PHP', 'MySQL', 'WooCommerce'],
            ['Video Editing', 'After Effects', 'Premiere Pro', 'Animation'],
            ['Java', 'Spring Boot', 'Microservices', 'AWS'],
            ['Vue.js', 'Angular', 'TypeScript', 'Frontend Development']
        ];

        const bios = [
            'Full-stack developer with 5 years of experience building scalable web applications.',
            'Data scientist passionate about turning data into actionable insights.',
            'Creative UI/UX designer focused on delivering beautiful and intuitive user experiences.',
            'Professional writer specializing in technical documentation and blog content.',
            'Digital marketing expert with proven track record of growing online businesses.',
            'Mobile app developer creating cross-platform solutions for iOS and Android.',
            'WordPress expert building custom themes and e-commerce solutions.',
            'Video editor and motion graphics designer bringing stories to life.',
            'Backend developer specializing in microservices and cloud architecture.',
            'Frontend developer crafting responsive and performant web interfaces.'
        ];

        for (let i = 0; i < 10; i++) {
            const freelancerUser = await User.create({
                email: `freelancer${i + 1}@example.com`,
                password: hashedPassword,
                fullName: freelancerNames[i],
                userType: 'freelancer',
                phoneNumber: `+23480${10000000 + i}`,
                isEmailVerified: true,
                createdAt: new Date(Date.now() - (i * 86400000))
            });

            await Profile.create({
                userId: freelancerUser._id,
                bio: bios[i],
                location: ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano'][i % 5] + ', Nigeria',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=freelancer${i + 1}`,
                skills: skillSets[i],
                hourlyRate: 2000 + (i * 500),
                rating: 4.0 + (Math.random() * 1),
                totalReviews: Math.floor(Math.random() * 50) + 10,
                completedProjects: Math.floor(Math.random() * 30) + 5,
                website: `https://portfolio-${i + 1}.com`,
                portfolio: [
                    {
                        title: `Project ${i * 2 + 1}`,
                        description: 'Amazing project description',
                        image: `https://picsum.photos/400/300?random=${i * 2 + 1}`,
                        link: `https://project${i * 2 + 1}.com`
                    },
                    {
                        title: `Project ${i * 2 + 2}`,
                        description: 'Another great project',
                        image: `https://picsum.photos/400/300?random=${i * 2 + 2}`,
                        link: `https://project${i * 2 + 2}.com`
                    }
                ]
            });

            freelancers.push(freelancerUser);
        }

        console.log('💼 Creating jobs...');
        // 4. Create Jobs
        const jobs = [];
        const jobData = [
            {
                title: 'E-commerce Mobile App Development',
                description: 'We need an experienced React Native developer to build a fully functional e-commerce mobile app for both iOS and Android. The app should include product listings, shopping cart, payment integration with Paystack, order tracking, and user authentication. Clean UI/UX is essential.',
                budget: 250000,
                duration: '2 months',
                skills: ['React Native', 'TypeScript', 'API Integration', 'Firebase'],
                category: 'Mobile Development',
                jobType: 'Fixed Price',
                status: 'open'
            },
            {
                title: 'Corporate Website Redesign',
                description: 'Looking for a talented web designer to redesign our corporate website. Need modern, professional design with focus on user experience. Must be mobile responsive and follow latest design trends. Provide at least 3 design concepts.',
                budget: 150000,
                duration: '1 month',
                skills: ['Figma', 'UI/UX Design', 'Web Design', 'Prototyping'],
                category: 'Design',
                jobType: 'Fixed Price',
                status: 'open'
            },
            {
                title: 'SEO Content Writing - 20 Blog Posts',
                description: 'Need an experienced content writer to create 20 SEO-optimized blog posts for our tech blog. Each post should be 1500-2000 words, well-researched, and engaging. Topics will be provided. Must understand SEO best practices.',
                budget: 100000,
                duration: '3 weeks',
                skills: ['Content Writing', 'SEO', 'Research', 'Tech Writing'],
                category: 'Writing',
                jobType: 'Fixed Price',
                status: 'open'
            },
            {
                title: 'Social Media Marketing Campaign',
                description: 'Seeking a digital marketing expert to manage our social media presence across Instagram, Facebook, and Twitter. Create engaging content, manage posts, run ads, and grow our follower base. 3-month campaign.',
                budget: 180000,
                duration: '3 months',
                skills: ['Social Media Marketing', 'Content Creation', 'Facebook Ads', 'Analytics'],
                category: 'Marketing',
                jobType: 'Fixed Price',
                status: 'in_progress'
            },
            {
                title: 'Backend API Development',
                description: 'Need a backend developer to build RESTful APIs for our web application. Technologies: Node.js, Express, MongoDB. Must include authentication, authorization, data validation, and comprehensive documentation.',
                budget: 200000,
                duration: '6 weeks',
                skills: ['Node.js', 'Express', 'MongoDB', 'REST API'],
                category: 'Backend Development',
                jobType: 'Fixed Price',
                status: 'in_progress'
            },
            {
                title: 'Logo and Brand Identity Design',
                description: 'Startup looking for creative designer to create our logo and complete brand identity including color palette, typography, business cards, and brand guidelines. Must provide multiple concepts and revisions.',
                budget: 80000,
                duration: '2 weeks',
                skills: ['Logo Design', 'Brand Identity', 'Illustrator', 'Graphic Design'],
                category: 'Design',
                jobType: 'Fixed Price',
                status: 'completed'
            },
            {
                title: 'WordPress E-commerce Store Setup',
                description: 'Need WordPress expert to set up a complete e-commerce store using WooCommerce. Include payment gateway integration, shipping setup, product categories, and custom theme customization.',
                budget: 120000,
                duration: '3 weeks',
                skills: ['WordPress', 'WooCommerce', 'PHP', 'E-commerce'],
                category: 'Web Development',
                jobType: 'Fixed Price',
                status: 'open'
            },
            {
                title: 'Product Explainer Video',
                description: 'Looking for video editor to create a 2-minute animated explainer video for our SaaS product. Script will be provided. Need professional voiceover, animations, and background music.',
                budget: 90000,
                duration: '2 weeks',
                skills: ['Video Editing', 'After Effects', 'Animation', 'Voiceover'],
                category: 'Video & Animation',
                jobType: 'Fixed Price',
                status: 'open'
            },
            {
                title: 'Database Migration and Optimization',
                description: 'Experienced database administrator needed to migrate our database from MySQL to PostgreSQL and optimize performance. Must ensure zero data loss and minimal downtime.',
                budget: 160000,
                duration: '1 month',
                skills: ['MySQL', 'PostgreSQL', 'Database Migration', 'Performance Optimization'],
                category: 'Database',
                jobType: 'Fixed Price',
                status: 'open'
            },
            {
                title: 'Mobile App UI/UX Design',
                description: 'Designer needed to create complete UI/UX design for fitness tracking mobile app. Include wireframes, mockups, and interactive prototypes. Must follow iOS and Android design guidelines.',
                budget: 140000,
                duration: '4 weeks',
                skills: ['Mobile Design', 'Figma', 'Prototyping', 'UI/UX'],
                category: 'Design',
                jobType: 'Fixed Price',
                status: 'in_progress'
            }
        ];

        for (let i = 0; i < jobData.length; i++) {
            const job = await Job.create({
                clientId: clientUser._id,
                ...jobData[i],
                proposalsCount: Math.floor(Math.random() * 15) + 5,
                postedAt: new Date(Date.now() - (i * 86400000))
            });
            jobs.push(job);
        }

        console.log('📝 Creating proposals...');
        // 5. Create Proposals
        const proposals = [];
        for (let i = 0; i < 25; i++) {
            const jobIndex = i % jobs.length;
            const freelancerIndex = i % freelancers.length;
            
            const proposal = await Proposal.create({
                jobId: jobs[jobIndex]._id,
                freelancerId: freelancers[freelancerIndex]._id,
                coverLetter: `Hello! I am very interested in your project "${jobs[jobIndex].title}". I have ${3 + i} years of experience in this field and have completed similar projects successfully. I can deliver high-quality work within your timeline and budget. Looking forward to working with you!`,
                proposedAmount: jobs[jobIndex].budget * (0.8 + Math.random() * 0.4),
                estimatedDuration: ['1 week', '2 weeks', '3 weeks', '1 month'][i % 4],
                status: ['pending', 'approved', 'rejected'][i % 3],
                submittedAt: new Date(Date.now() - (i * 43200000))
            });
            proposals.push(proposal);
        }

        console.log('🚀 Creating active projects...');
        // 6. Create Active Projects
        const projectTitles = [
            'Social Media Marketing Campaign',
            'Backend API Development',
            'Mobile App UI/UX Design',
            'WordPress Website Development',
            'Video Production for Marketing'
        ];

        for (let i = 0; i < 5; i++) {
            await Project.create({
                jobId: jobs[i + 3]._id,
                clientId: clientUser._id,
                freelancerId: freelancers[i]._id,
                title: projectTitles[i],
                description: `Active project for ${projectTitles[i]}. Working on deliverables and maintaining regular communication.`,
                budget: 100000 + (i * 50000),
                status: ['in_progress', 'review', 'completed'][i % 3],
                progress: 30 + (i * 15),
                startDate: new Date(Date.now() - (i * 604800000)),
                dueDate: new Date(Date.now() + ((30 - i * 5) * 86400000)),
                createdAt: new Date(Date.now() - (i * 604800000))
            });
        }

        console.log('💬 Creating messages and conversations...');
        // 7. Create Messages/Conversations
        for (let i = 0; i < 5; i++) {
            const conversation = await Conversation.create({
                participants: [clientUser._id, freelancers[i]._id],
                lastMessage: `This is the latest message in our conversation about the project.`,
                lastMessageAt: new Date(Date.now() - (i * 3600000)),
                createdAt: new Date(Date.now() - (10 * 86400000))
            });

            // Add messages to conversation
            const messagePairs = [
                ['Hi! I saw your job posting and I\'m very interested.', 'Great! Let me tell you more about the project.'],
                ['What is your availability for this project?', 'I can start immediately and dedicate 40 hours per week.'],
                ['Can you share some of your previous work?', 'Sure! Here\'s my portfolio link with similar projects.'],
                ['The project looks good. When can we start?', 'I\'m ready to begin as soon as we finalize the contract.'],
                ['I\'ve sent you the project brief.', 'Received! I\'ll review it and get back to you soon.']
            ];

            for (let j = 0; j < 5; j++) {
                await Message.create({
                    conversationId: conversation._id,
                    senderId: freelancers[i]._id,
                    receiverId: clientUser._id,
                    content: messagePairs[j][0],
                    isRead: j < 3,
                    sentAt: new Date(Date.now() - ((10 - j * 2) * 3600000))
                });

                await Message.create({
                    conversationId: conversation._id,
                    senderId: clientUser._id,
                    receiverId: freelancers[i]._id,
                    content: messagePairs[j][1],
                    isRead: j < 3,
                    sentAt: new Date(Date.now() - ((9 - j * 2) * 3600000))
                });
            }
        }

        console.log('💰 Creating wallet and transactions...');
        // 8. Create Wallet and Transactions
        await Wallet.create({
            userId: clientUser._id,
            balance: 450000,
            currency: 'NGN',
            createdAt: new Date()
        });

        const transactionData = [
            { type: 'deposit', amount: 500000, description: 'Wallet Top-up via Paystack', status: 'completed' },
            { type: 'payment', amount: 150000, description: 'Payment for Website Redesign Project', status: 'completed' },
            { type: 'payment', amount: 80000, description: 'Payment for Logo Design', status: 'completed' },
            { type: 'deposit', amount: 200000, description: 'Wallet Funding', status: 'completed' },
            { type: 'payment', amount: 120000, description: 'Payment for Content Writing', status: 'completed' },
            { type: 'refund', amount: 50000, description: 'Refund for Cancelled Project', status: 'completed' },
            { type: 'payment', amount: 100000, description: 'Milestone Payment for Mobile App', status: 'pending' },
            { type: 'withdrawal', amount: 75000, description: 'Bank Withdrawal', status: 'completed' },
            { type: 'payment', amount: 90000, description: 'Payment for Video Editing', status: 'completed' },
            { type: 'deposit', amount: 300000, description: 'Account Credit', status: 'completed' }
        ];

        for (let i = 0; i < transactionData.length; i++) {
            await Transaction.create({
                userId: clientUser._id,
                ...transactionData[i],
                reference: `TXN${Date.now()}${i}`,
                createdAt: new Date(Date.now() - (i * 172800000))
            });
        }

        console.log('🔔 Creating notifications...');
        // 9. Create Notifications
        const notificationData = [
            { type: 'proposal', title: 'New Proposal Received', message: 'Sarah Johnson submitted a proposal for your E-commerce Mobile App project' },
            { type: 'message', title: 'New Message', message: 'Michael Chen sent you a message about Backend API Development' },
            { type: 'payment', title: 'Payment Successful', message: 'Your payment of ₦150,000 has been processed successfully' },
            { type: 'milestone', title: 'Milestone Completed', message: 'David Okafor marked a milestone as complete in your project' },
            { type: 'proposal', title: 'New Proposal Received', message: 'Amina Ibrahim submitted a proposal for your Website Redesign' },
            { type: 'review', title: 'Review Reminder', message: 'Please review the completed work for Logo Design project' },
            { type: 'message', title: 'New Message', message: 'Fatima Bello sent you a message' },
            { type: 'project', title: 'Project Update', message: 'Your project "Social Media Campaign" status changed to In Progress' },
            { type: 'proposal', title: 'Proposal Accepted', message: 'Your proposal for Mobile App UI/UX was accepted' },
            { type: 'payment', title: 'Payment Received', message: 'You received a payment of ₦200,000' },
            { type: 'contract', title: 'Contract Signed', message: 'Emmanuel Eze signed the project contract' },
            { type: 'message', title: 'New Message', message: 'Grace Adeleke sent you a message about the project timeline' },
            { type: 'deadline', title: 'Deadline Approaching', message: 'Your project deadline is in 3 days' },
            { type: 'proposal', title: 'New Proposal Received', message: 'Ibrahim Musa submitted a proposal for Database Migration' },
            { type: 'system', title: 'Account Security', message: 'Your account password was successfully updated' }
        ];

        for (let i = 0; i < notificationData.length; i++) {
            await Notification.create({
                userId: clientUser._id,
                ...notificationData[i],
                isRead: i > 10,
                link: `/notifications/${i}`,
                createdAt: new Date(Date.now() - (i * 7200000))
            });
        }

        console.log('⭐ Creating reviews...');
        // 10. Create Reviews
        const reviewComments = [
            'Excellent work! Very professional and delivered on time. Highly recommended!',
            'Great communication and quality work. Will definitely hire again.',
            'Outstanding freelancer! Exceeded my expectations on every level.',
            'Very skilled and responsive. Completed the project perfectly.',
            'Amazing experience working together. Top-notch quality!',
            'Professional, reliable, and delivered exactly what was needed.',
            'Fantastic work! Very creative and understood the requirements perfectly.',
            'Highly recommend! Great attention to detail and timely delivery.'
        ];

        for (let i = 0; i < 8; i++) {
            await Review.create({
                reviewerId: clientUser._id,
                revieweeId: freelancers[i]._id,
                projectId: jobs[i]._id,
                rating: 4 + (Math.random() * 1),
                comment: reviewComments[i],
                createdAt: new Date(Date.now() - (i * 259200000))
            });
        }

        console.log('📄 Creating contracts...');
        // 11. Create Contracts
        for (let i = 0; i < 3; i++) {
            await Contract.create({
                projectId: jobs[i + 3]._id,
                clientId: clientUser._id,
                freelancerId: freelancers[i]._id,
                terms: `This contract outlines the terms and conditions for the project "${projectTitles[i]}". The freelancer agrees to deliver the work as specified in the project description within the agreed timeline. Payment will be released upon successful completion and client approval.`,
                amount: 100000 + (i * 50000),
                status: ['active', 'active', 'completed'][i],
                clientSigned: true,
                freelancerSigned: true,
                createdAt: new Date(Date.now() - (i * 604800000))
            });
        }

        console.log('\n✅ Database seeding completed successfully!\n');
        console.log('📊 Summary:');
        console.log(`   - 1 Client User (${clientUser.email})`);
        console.log(`   - 10 Freelancer Users`);
        console.log(`   - ${jobs.length} Jobs`);
        console.log(`   - ${proposals.length} Proposals`);
        console.log(`   - 5 Active Projects`);
        console.log(`   - 5 Conversations with 50 Messages`);
        console.log(`   - 1 Wallet with ${transactionData.length} Transactions`);
        console.log(`   - ${notificationData.length} Notifications`);
        console.log(`   - 8 Reviews`);
        console.log(`   - 3 Contracts`);
        console.log('\n💡 Login credentials:');
        console.log(`   Email: uteach38@gmail.com`);
        console.log(`   Password: password123\n`);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
};

// Run the seed function
seedDatabase();
