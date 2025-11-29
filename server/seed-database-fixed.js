/**
 * Database Seeding Script for Connecta Backend
 * Matches actual backend models
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB Connection String
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/connecta';

// Connect to MongoDB
mongoose.connect(MONGODB_URI).then(() => {
    console.log('✅ Connected to MongoDB');
}).catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

// Import your actual models
const User = require('./dist/models/user.model').default;
const Profile = require('./dist/models/Profile.model').default;
const Job = require('./dist/models/Job.model').default;
const Project = require('./dist/models/Project.model').default;
const Notification = require('./dist/models/Notification.model').default;
const Message = require('./dist/models/Message.model').default;
const Wallet = require('./dist/models/Wallet.model').default;
const Payment = require('./dist/models/Payment.model').default;
const Review = require('./dist/models/Review.model').default;
const Contract = require('./dist/models/Contract.model').default;

// Seed Data
const seedDatabase = async () => {
    try {
        console.log('🔄 Clearing existing data...');
        await User.deleteMany({});
        await Profile.deleteMany({});
        await Job.deleteMany({});
        await Project.deleteMany({});
        await Notification.deleteMany({});
        await Message.deleteMany({});
        await Wallet.deleteMany({});
        await Payment.deleteMany({});
        await Review.deleteMany({});
        await Contract.deleteMany({});

        console.log('👤 Creating client user...');
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        // 1. Create Client User
        const clientUser = await User.create({
            email: 'uteach38@gmail.com',
            password: hashedPassword,
            firstName: 'John',
            lastName: 'Doe',
            userType: 'client',
            isActive: true
        });

        console.log('✅ Client user created:', clientUser.email);

        // 2. Create Client Profile
        await Profile.create({
            user: clientUser._id,
            phoneNumber: '+2348012345678',
            location: 'Lagos, Nigeria',
            skills: ['Project Management', 'Business Development', 'Strategy'],
            education: [{
                institution: 'University of Lagos',
                degree: 'MBA',
                fieldOfStudy: 'Business Administration',
                description: 'Master of Business Administration',
                startDate: new Date('2015-09-01'),
                endDate: new Date('2017-06-01')
            }],
            languages: [
                { language: 'English', proficiency: 'native' },
                { language: 'Yoruba', proficiency: 'fluent' }
            ]
        });

        console.log('👥 Creating freelancers...');
        const freelancers = [];
        const freelancerNames = [
            ['Sarah', 'Johnson'], ['Michael', 'Chen'], ['Amina', 'Ibrahim'],
            ['David', 'Okafor'], ['Fatima', 'Bello'], ['Emmanuel', 'Eze'],
            ['Grace', 'Adeleke'], ['Ibrahim', 'Musa'], ['Chioma', 'Nwosu'],
            ['Ahmed', 'Abdullahi']
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

        for (let i = 0; i < 10; i++) {
            const freelancerUser = await User.create({
                email: `freelancer${i + 1}@example.com`,
                password: hashedPassword,
                firstName: freelancerNames[i][0],
                lastName: freelancerNames[i][1],
                userType: 'freelancer',
                isActive: true
            });

            await Profile.create({
                user: freelancerUser._id,
                phoneNumber: `+23480${10000000 + i}`,
                location: ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano'][i % 5] + ', Nigeria',
                skills: skillSets[i],
                languages: [{ language: 'English', proficiency: 'fluent' }]
            });

            freelancers.push(freelancerUser);
        }

        console.log('💼 Creating jobs...');
        const jobs = [];
        const jobData = [
            {
                title: 'E-commerce Mobile App Development',
                description: 'We need an experienced React Native developer to build a fully functional e-commerce mobile app.',
                budget: 250000,
                duration: '2 months',
                skills: ['React Native', 'TypeScript', 'API Integration'],
                category: 'Mobile Development',
                status: 'open'
            },
            {
                title: 'Corporate Website Redesign',
                description: 'Looking for a talented web designer to redesign our corporate website.',
                budget: 150000,
                duration: '1 month',
                skills: ['Figma', 'UI/UX Design', 'Web Design'],
                category: 'Design',
                status: 'open'
            },
            {
                title: 'SEO Content Writing - 20 Blog Posts',
                description: 'Need an experienced content writer to create 20 SEO-optimized blog posts.',
                budget: 100000,
                duration: '3 weeks',
                skills: ['Content Writing', 'SEO', 'Research'],
                category: 'Writing',
                status: 'open'
            },
            {
                title: 'Social Media Marketing Campaign',
                description: 'Seeking a digital marketing expert to manage our social media presence.',
                budget: 180000,
                duration: '3 months',
                skills: ['Social Media Marketing', 'Content Creation', 'Facebook Ads'],
                category: 'Marketing',
                status: 'in_progress'
            },
            {
                title: 'Backend API Development',
                description: 'Need a backend developer to build RESTful APIs for our web application.',
                budget: 200000,
                duration: '6 weeks',
                skills: ['Node.js', 'Express', 'MongoDB'],
                category: 'Backend Development',
                status: 'in_progress'
            }
        ];

        for (let i = 0; i < 5; i++) {
            const job = await Job.create({
                client: clientUser._id,
                title: jobData[i].title,
                description: jobData[i].description,
                budget: jobData[i].budget,
                duration: jobData[i].duration,
                skills: jobData[i].skills,
                category: jobData[i].category,
                status: jobData[i].status,
                deadline: new Date(Date.now() + (30 * 86400000))
            });
            jobs.push(job);
        }

        console.log('🚀 Creating projects...');
        for (let i = 0; i < 3; i++) {
            await Project.create({
                job: jobs[i]._id,
                client: clientUser._id,
                freelancer: freelancers[i]._id,
                title: jobData[i].title,
                description: jobData[i].description,
                budget: jobData[i].budget,
                status: ['in_progress', 'in_progress', 'completed'][i],
                startDate: new Date(Date.now() - (i * 604800000)),
                deadline: new Date(Date.now() + ((30 - i * 10) * 86400000))
            });
        }

        console.log('💰 Creating wallet...');
        await Wallet.create({
            user: clientUser._id,
            balance: 450000
        });

        console.log('💳 Creating payments...');
        const paymentTypes = ['deposit', 'withdrawal', 'payment', 'refund'];
        for (let i = 0; i < 10; i++) {
            await Payment.create({
                user: clientUser._id,
                amount: 50000 + (i * 10000),
                type: paymentTypes[i % 4],
                status: i < 8 ? 'completed' : 'pending',
                reference: `TXN${Date.now()}${i}`,
                description: `Transaction ${i + 1} - ${paymentTypes[i % 4]}`
            });
        }

        console.log('🔔 Creating notifications...');
        const notificationData = [
            { type: 'job_posted', title: 'Job Posted Successfully', message: 'Your job "E-commerce Mobile App" has been posted' },
            { type: 'proposal_received', title: 'New Proposal', message: 'You received a new proposal for your job' },
            { type: 'message', title: 'New Message', message: 'You have a new message from a freelancer' },
            { type: 'payment', title: 'Payment Successful', message: 'Your payment of ₦150,000 was processed' },
            { type: 'project_update', title: 'Project Update', message: 'Your project status has been updated' }
        ];

        for (let i = 0; i < 5; i++) {
            await Notification.create({
                user: clientUser._id,
                type: notificationData[i].type,
                title: notificationData[i].title,
                message: notificationData[i].message,
                isRead: i > 2
            });
        }

        console.log('⭐ Creating reviews...');
        for (let i = 0; i < 3; i++) {
            await Review.create({
                reviewer: clientUser._id,
                reviewee: freelancers[i]._id,
                project: null,
                rating: 4 + Math.random(),
                comment: 'Excellent work! Very professional and delivered on time.'
            });
        }

        console.log('\n✅ Database seeding completed successfully!\n');
        console.log('📊 Summary:');
        console.log(`   - 1 Client User (${clientUser.email})`);
        console.log(`   - 10 Freelancer Users`);
        console.log(`   - 5 Jobs`);
        console.log(`   - 3 Active Projects`);
        console.log(`   - 1 Wallet with ₦450,000`);
        console.log(`   - 10 Payments`);
        console.log(`   - 5 Notifications`);
        console.log(`   - 3 Reviews`);
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

seedDatabase();
