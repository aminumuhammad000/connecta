const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/connecta';

mongoose.connect(MONGODB_URI).then(() => {
    console.log('✅ Connected to MongoDB');
}).catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

const User = require('./dist/models/user.model').default;
const Profile = require('./dist/models/Profile.model').default;
const Job = require('./dist/models/Job.model').default;
const Project = require('./dist/models/Project.model').default;
const Notification = require('./dist/models/Notification.model').default;
const Wallet = require('./dist/models/Wallet.model').default;
const Payment = require('./dist/models/Payment.model').default;
const Review = require('./dist/models/Review.model').default;

const seedDatabase = async () => {
    try {
        console.log('🔄 Clearing existing data...');
        await User.deleteMany({});
        await Profile.deleteMany({});
        await Job.deleteMany({});
        await Project.deleteMany({});
        await Notification.deleteMany({});
        await Wallet.deleteMany({});
        await Payment.deleteMany({});
        await Review.deleteMany({});

        console.log('👤 Creating client user...');
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        const clientUser = await User.create({
            email: 'uteach38@gmail.com',
            password: hashedPassword,
            firstName: 'John',
            lastName: 'Doe',
            userType: 'client',
            isActive: true
        });

        console.log('✅ Client user created:', clientUser.email);

        await Profile.create({
            user: clientUser._id,
            phoneNumber: '+2348012345678',
            location: 'Lagos, Nigeria',
            skills: ['Project Management', 'Business Development'],
            education: [{
                institution: 'University of Lagos',
                degree: 'MBA',
                fieldOfStudy: 'Business Administration',
                description: 'Master of Business Administration',
                startDate: new Date('2015-09-01'),
                endDate: new Date('2017-06-01')
            }],
            languages: [
                { language: 'English', proficiency: 'native' }
            ]
        });

        console.log('�� Creating freelancers...');
        const freelancers = [];
        const names = [
            ['Sarah', 'Johnson'], ['Michael', 'Chen'], ['Amina', 'Ibrahim'],
            ['David', 'Okafor'], ['Fatima', 'Bello'], ['Emmanuel', 'Eze'],
            ['Grace', 'Adeleke'], ['Ibrahim', 'Musa'], ['Chioma', 'Nwosu'],
            ['Ahmed', 'Abdullahi']
        ];
        
        const skillSets = [
            ['JavaScript', 'React', 'Node.js'],
            ['Python', 'Django', 'ML'],
            ['Figma', 'UI/UX'],
            ['Content Writing', 'SEO'],
            ['Digital Marketing'],
            ['React Native', 'Mobile'],
            ['WordPress', 'PHP'],
            ['Video Editing'],
            ['Java', 'Spring'],
            ['Vue.js', 'Angular']
        ];

        for (let i = 0; i < 10; i++) {
            const freelancerUser = await User.create({
                email: `freelancer${i + 1}@example.com`,
                password: hashedPassword,
                firstName: names[i][0],
                lastName: names[i][1],
                userType: 'freelancer',
                isActive: true
            });

            await Profile.create({
                user: freelancerUser._id,
                phoneNumber: `+23480${10000000 + i}`,
                location: ['Lagos', 'Abuja', 'Port Harcourt'][i % 3] + ', Nigeria',
                skills: skillSets[i],
                languages: [{ language: 'English', proficiency: 'fluent' }]
            });

            freelancers.push(freelancerUser);
        }

        console.log('💼 Creating jobs...');
        const jobs = [];
        const jobsData = [
            {
                title: 'E-commerce Mobile App Developer',
                company: 'TechStartup Inc',
                location: 'Lagos, Nigeria',
                experience: '3-5 years',
                description: 'We need an experienced React Native developer to build a fully functional e-commerce mobile app for both iOS and Android.',
                skills: ['React Native', 'TypeScript', 'API Integration'],
                requirements: ['3+ years React Native', 'Portfolio of apps', 'Good communication'],
                category: 'Mobile Development'
            },
            {
                title: 'UI/UX Designer for Website',
                company: 'Design Co',
                location: 'Abuja, Nigeria',
                experience: '2-4 years',
                description: 'Looking for a talented web designer to redesign our corporate website with modern UI/UX.',
                skills: ['Figma', 'UI/UX Design', 'Web Design'],
                requirements: ['Strong portfolio', 'Figma expert', 'User research skills'],
                category: 'Design'
            },
            {
                title: 'Content Writer - Tech Blog',
                company: 'Media House',
                location: 'Remote',
                experience: '1-3 years',
                description: 'Need an experienced content writer to create 20 SEO-optimized blog posts for our tech blog.',
                skills: ['Content Writing', 'SEO', 'Research'],
                requirements: ['SEO knowledge', 'Tech writing experience', 'Fast turnaround'],
                category: 'Writing'
            },
            {
                title: 'Social Media Manager',
                company: 'Marketing Agency',
                location: 'Lagos, Nigeria',
                experience: '2-3 years',
                description: 'Seeking a digital marketing expert to manage social media presence across multiple platforms.',
                skills: ['Social Media', 'Content Creation', 'Analytics'],
                requirements: ['Proven track record', 'Content creation skills', 'Analytics expertise'],
                category: 'Marketing'
            },
            {
                title: 'Backend Developer - Node.js',
                company: 'SaaS Company',
                location: 'Remote',
                experience: '3-5 years',
                description: 'Need a backend developer to build RESTful APIs for our web application using Node.js.',
                skills: ['Node.js', 'Express', 'MongoDB'],
                requirements: ['API development', 'Database design', 'Testing experience'],
                category: 'Backend Development'
            },
            {
                title: 'Full Stack Developer',
                company: 'E-commerce Platform',
                location: 'Port Harcourt, Nigeria',
                experience: '4-6 years',
                description: 'Looking for full stack developer to build complete e-commerce solution.',
                skills: ['React', 'Node.js', 'MongoDB', 'AWS'],
                requirements: ['Full stack experience', 'E-commerce knowledge', 'DevOps skills'],
                category: 'Full Stack'
            },
            {
                title: 'WordPress Developer',
                company: 'Digital Agency',
                location: 'Lagos, Nigeria',
                experience: '2-4 years',
                description: 'Need WordPress expert to customize themes and develop plugins.',
                skills: ['WordPress', 'PHP', 'MySQL'],
                requirements: ['Theme customization', 'Plugin development', 'WooCommerce'],
                category: 'Web Development'
            },
            {
                title: 'Data Analyst',
                company: 'FinTech Startup',
                location: 'Remote',
                experience: '2-3 years',
                description: 'Seeking data analyst to analyze user behavior and provide insights.',
                skills: ['Python', 'SQL', 'Data Visualization'],
                requirements: ['Statistics knowledge', 'Python/R', 'Communication skills'],
                category: 'Data Science'
            },
            {
                title: 'Mobile App Tester',
                company: 'QA Services',
                location: 'Abuja, Nigeria',
                experience: '1-2 years',
                description: 'Need QA engineer to test mobile applications on various devices.',
                skills: ['Testing', 'Mobile Apps', 'Bug Reporting'],
                requirements: ['Testing experience', 'Attention to detail', 'Documentation'],
                category: 'QA Testing'
            },
            {
                title: 'Graphic Designer',
                company: 'Creative Studio',
                location: 'Lagos, Nigeria',
                experience: '2-4 years',
                description: 'Looking for graphic designer to create marketing materials and brand assets.',
                skills: ['Photoshop', 'Illustrator', 'Brand Design'],
                requirements: ['Portfolio required', 'Brand design', 'Print & digital'],
                category: 'Design'
            }
        ];

        for (let i = 0; i < 10; i++) {
            const job = await Job.create({
                clientId: clientUser._id,
                title: jobsData[i].title,
                company: jobsData[i].company,
                location: jobsData[i].location,
                locationType: 'remote',
                jobType: 'freelance',
                description: jobsData[i].description,
                experience: jobsData[i].experience,
                skills: jobsData[i].skills,
                requirements: jobsData[i].requirements,
                category: jobsData[i].category,
                status: i < 7 ? 'active' : 'closed',
                budget: `${50000 + (i * 20000)}`,
                budgetType: 'fixed',
                summary: jobsData[i].description.substring(0, 100),
                connectsRequired: '5',
                deliverables: ['Final deliverable', 'Source code', 'Documentation'],
                applicants: Math.floor(Math.random() * 20),
                posted: new Date(Date.now() - (i * 86400000)),
                deadline: new Date(Date.now() + (30 * 86400000)),
                paymentVerified: true
            });
            jobs.push(job);
        }

        console.log('🚀 Creating projects...');
        for (let i = 0; i < 3; i++) {
            await Project.create({
                job: jobs[i]._id,
                client: clientUser._id,
                freelancer: freelancers[i]._id,
                title: jobsData[i].title,
                description: jobsData[i].description,
                budget: 100000 + (i * 50000),
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
        const notifications = [
            { type: 'job_posted', title: 'Job Posted', message: 'Your job has been posted successfully' },
            { type: 'proposal', title: 'New Proposal', message: 'You received a new proposal' },
            { type: 'message', title: 'New Message', message: 'You have a new message' },
            { type: 'payment', title: 'Payment Success', message: 'Payment processed successfully' },
            { type: 'project', title: 'Project Update', message: 'Project status updated' },
            { type: 'review', title: 'New Review', message: 'You received a new review' },
            { type: 'milestone', title: 'Milestone', message: 'Milestone completed' },
            { type: 'deadline', title: 'Deadline', message: 'Project deadline approaching' }
        ];

        for (let i = 0; i < 8; i++) {
            await Notification.create({
                user: clientUser._id,
                type: notifications[i].type,
                title: notifications[i].title,
                message: notifications[i].message,
                isRead: i > 5
            });
        }

        console.log('⭐ Creating reviews...');
        for (let i = 0; i < 3; i++) {
            await Review.create({
                reviewer: clientUser._id,
                reviewee: freelancers[i]._id,
                rating: 4.5 + (Math.random() * 0.5),
                comment: 'Excellent work! Very professional and delivered on time. Highly recommend!'
            });
        }

        console.log('\n✅ Database seeding completed successfully!\n');
        console.log('📊 Summary:');
        console.log(`   - 1 Client User (${clientUser.email})`);
        console.log(`   - 10 Freelancer Users`);
        console.log(`   - 10 Jobs (7 active, 3 closed)`);
        console.log(`   - 3 Projects`);
        console.log(`   - 1 Wallet (₦450,000)`);
        console.log(`   - 10 Payments`);
        console.log(`   - 8 Notifications`);
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
