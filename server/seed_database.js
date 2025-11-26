const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB direct connection for seeding
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/connecta';

const seedData = {
  users: [
    // Freelancers
    {
      firstName: 'Usman',
      lastName: 'Garba',
      email: 'usman.garba@example.com',
      password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
      userType: 'freelancer',
      phoneNumber: '+2348123456789',
      location: 'Kano, Nigeria',
      isActive: true,
      isEmailVerified: true
    },
    {
      firstName: 'Aisha',
      lastName: 'Bello',
      email: 'aisha.bello@example.com',
      password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
      userType: 'freelancer',
      phoneNumber: '+2348234567890',
      location: 'Lagos, Nigeria',
      isActive: true,
      isEmailVerified: true
    },
    {
      firstName: 'Ibrahim',
      lastName: 'Sani',
      email: 'ibrahim.sani@example.com',
      password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
      userType: 'freelancer',
      phoneNumber: '+2348345678901',
      location: 'Abuja, Nigeria',
      isActive: true,
      isEmailVerified: true
    },
    // Clients
    {
      firstName: 'Ahmad',
      lastName: 'Ibrahim',
      email: 'ahmad.ibrahim@example.com',
      password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
      userType: 'client',
      phoneNumber: '+2348111111111',
      location: 'Lagos, Nigeria',
      isActive: true,
      isEmailVerified: true
    },
    {
      firstName: 'Maryam',
      lastName: 'Hassan',
      email: 'maryam.hassan@example.com',
      password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
      userType: 'client',
      phoneNumber: '+2348222222222',
      location: 'Abuja, Nigeria',
      isActive: true,
      isEmailVerified: true
    },
    {
      firstName: 'Yusuf',
      lastName: 'Mohammed',
      email: 'yusuf.mohammed@example.com',
      password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
      userType: 'client',
      phoneNumber: '+2348333333333',
      location: 'Port Harcourt, Nigeria',
      isActive: true,
      isEmailVerified: true
    }
  ]
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // Clear existing data (optional - comment out to keep existing)
    // console.log('🧹 Clearing existing data...');
    // await db.collection('projects').deleteMany({});
    // await db.collection('proposals').deleteMany({});
    // await db.collection('payments').deleteMany({});
    // await db.collection('jobs').deleteMany({});
    // await db.collection('contracts').deleteMany({});
    // await db.collection('reviews').deleteMany({});
    // await db.collection('notifications').deleteMany({});

    // Insert users
    console.log('👥 Creating users...');
    const existingUsers = await db.collection('users').find({}).toArray();
    const userMap = {};
    
    for (const userData of seedData.users) {
      let user = existingUsers.find(u => u.email === userData.email);
      if (!user) {
        const result = await db.collection('users').insertOne({
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        user = { _id: result.insertedId, ...userData };
        console.log(`  ✅ Created: ${userData.firstName} ${userData.lastName}`);
      } else {
        console.log(`  ⏭️  Exists: ${userData.firstName} ${userData.lastName}`);
      }
      userMap[userData.email] = user._id;
    }

    // Get user references
    const usman = userMap['usman.garba@example.com'];
    const aisha = userMap['aisha.bello@example.com'];
    const ibrahim = userMap['ibrahim.sani@example.com'];
    const ahmad = userMap['ahmad.ibrahim@example.com'];
    const maryam = userMap['maryam.hassan@example.com'];
    const yusuf = userMap['yusuf.mohammed@example.com'];

    // Create Jobs
    console.log('\n💼 Creating jobs...');
    const jobsData = [
      {
        title: 'Full Stack Developer for SaaS Platform',
        description: 'Looking for an experienced full-stack developer to build a SaaS platform for project management.',
        category: 'Web Development',
        clientId: ahmad,
        budget: 2500000,
        duration: '3-6 months',
        experienceLevel: 'Expert',
        skills: ['React', 'Node.js', 'MongoDB', 'AWS'],
        status: 'open',
        applicantsCount: 5,
        createdAt: new Date('2024-11-01'),
        updatedAt: new Date('2024-11-20')
      },
      {
        title: 'Mobile App UI/UX Designer',
        description: 'Need a talented designer to create modern, user-friendly interfaces for our mobile application.',
        category: 'Design',
        clientId: maryam,
        budget: 800000,
        duration: '1-2 months',
        experienceLevel: 'Intermediate',
        skills: ['Figma', 'UI/UX', 'Mobile Design', 'Prototyping'],
        status: 'open',
        applicantsCount: 8,
        createdAt: new Date('2024-11-10'),
        updatedAt: new Date('2024-11-22')
      },
      {
        title: 'E-commerce Platform Development',
        description: 'Build a complete e-commerce solution with payment integration and inventory management.',
        category: 'Web Development',
        clientId: yusuf,
        budget: 1800000,
        duration: '2-4 months',
        experienceLevel: 'Expert',
        skills: ['React', 'Next.js', 'Stripe', 'PostgreSQL'],
        status: 'in-progress',
        applicantsCount: 3,
        createdAt: new Date('2024-10-15'),
        updatedAt: new Date('2024-11-15')
      },
      {
        title: 'Content Writer for Tech Blog',
        description: 'Looking for technical content writers to create engaging articles about software development.',
        category: 'Writing',
        clientId: ahmad,
        budget: 500000,
        duration: '1 month',
        experienceLevel: 'Intermediate',
        skills: ['Technical Writing', 'SEO', 'Research'],
        status: 'open',
        applicantsCount: 12,
        createdAt: new Date('2024-11-18'),
        updatedAt: new Date('2024-11-24')
      },
      {
        title: 'Video Editor for YouTube Channel',
        description: 'Need a skilled video editor for regular YouTube content creation.',
        category: 'Video Editing',
        clientId: maryam,
        budget: 600000,
        duration: 'Ongoing',
        experienceLevel: 'Intermediate',
        skills: ['Adobe Premiere', 'After Effects', 'Color Grading'],
        status: 'closed',
        applicantsCount: 15,
        createdAt: new Date('2024-10-20'),
        updatedAt: new Date('2024-11-05')
      }
    ];

    for (const job of jobsData) {
      const existing = await db.collection('jobs').findOne({ title: job.title });
      if (!existing) {
        await db.collection('jobs').insertOne(job);
        console.log(`  ✅ Created job: ${job.title}`);
      } else {
        console.log(`  ⏭️  Job exists: ${job.title}`);
      }
    }

    // Create more Projects
    console.log('\n📁 Creating projects...');
    const projectsData = [
      {
        title: 'E-commerce Mobile App Development',
        description: 'Build a React Native mobile app for online marketplace with payment integration, user authentication, and real-time notifications.',
        summary: 'Full-featured e-commerce mobile application',
        dateRange: { startDate: new Date('2024-08-15'), endDate: new Date('2024-11-15') },
        status: 'completed',
        statusLabel: 'Completed',
        clientId: ahmad,
        clientName: 'Ahmad Ibrahim',
        clientVerified: true,
        freelancerId: usman,
        budget: { amount: 850000, currency: '₦', type: 'fixed' },
        projectType: 'Mobile App',
        deliverables: ['iOS App', 'Android App', 'Admin Dashboard', 'API Documentation'],
        milestones: [
          { title: 'Design', status: 'completed', dueDate: new Date('2024-09-01'), amount: 150000 },
          { title: 'Development', status: 'completed', dueDate: new Date('2024-10-15'), amount: 500000 },
          { title: 'Testing', status: 'completed', dueDate: new Date('2024-11-15'), amount: 200000 }
        ],
        createdAt: new Date('2024-08-10'),
        updatedAt: new Date('2024-11-15')
      },
      {
        title: 'Corporate Website Redesign',
        description: 'Modern, responsive website with CMS integration and SEO optimization.',
        summary: 'Professional corporate website',
        dateRange: { startDate: new Date('2024-11-01'), endDate: new Date('2024-12-15') },
        status: 'ongoing',
        statusLabel: 'In Progress',
        clientId: maryam,
        clientName: 'Maryam Hassan',
        clientVerified: true,
        freelancerId: aisha,
        budget: { amount: 450000, currency: '₦', type: 'fixed' },
        projectType: 'Web Development',
        deliverables: ['Responsive Design', 'CMS Integration', 'SEO Setup'],
        milestones: [
          { title: 'Design', status: 'completed', dueDate: new Date('2024-11-10'), amount: 100000 },
          { title: 'Development', status: 'in-progress', dueDate: new Date('2024-12-01'), amount: 250000 },
          { title: 'Launch', status: 'pending', dueDate: new Date('2024-12-15'), amount: 100000 }
        ],
        createdAt: new Date('2024-10-25'),
        updatedAt: new Date('2024-11-25')
      },
      {
        title: 'Restaurant Booking System',
        description: 'Web-based reservation system with real-time availability and notifications.',
        summary: 'Complete booking management system',
        dateRange: { startDate: new Date('2024-10-10'), endDate: new Date('2024-12-10') },
        status: 'ongoing',
        statusLabel: 'Active',
        clientId: ahmad,
        clientName: 'Ahmad Ibrahim',
        clientVerified: true,
        freelancerId: ibrahim,
        budget: { amount: 320000, currency: '₦', type: 'fixed' },
        projectType: 'Web Application',
        deliverables: ['Booking Interface', 'Admin Dashboard', 'Email Notifications'],
        milestones: [
          { title: 'Backend', status: 'completed', dueDate: new Date('2024-10-25'), amount: 120000 },
          { title: 'Frontend', status: 'in-progress', dueDate: new Date('2024-11-20'), amount: 150000 },
          { title: 'Testing', status: 'pending', dueDate: new Date('2024-12-10'), amount: 50000 }
        ],
        createdAt: new Date('2024-10-05'),
        updatedAt: new Date('2024-11-25')
      },
      {
        title: 'Social Media Management Dashboard',
        description: 'Dashboard for managing multiple social media accounts with analytics and scheduling.',
        summary: 'Multi-platform social media tool',
        dateRange: { startDate: new Date('2024-09-01'), endDate: new Date('2024-11-30') },
        status: 'completed',
        statusLabel: 'Completed',
        clientId: yusuf,
        clientName: 'Yusuf Mohammed',
        clientVerified: false,
        freelancerId: aisha,
        budget: { amount: 950000, currency: '₦', type: 'fixed' },
        projectType: 'Web Application',
        deliverables: ['Dashboard UI', 'API Integration', 'Analytics Module', 'Scheduler'],
        milestones: [
          { title: 'Planning', status: 'completed', dueDate: new Date('2024-09-15'), amount: 150000 },
          { title: 'Development', status: 'completed', dueDate: new Date('2024-10-30'), amount: 600000 },
          { title: 'Deployment', status: 'completed', dueDate: new Date('2024-11-30'), amount: 200000 }
        ],
        createdAt: new Date('2024-08-25'),
        updatedAt: new Date('2024-11-30')
      },
      {
        title: 'Inventory Management System',
        description: 'Custom inventory tracking system for warehouse management with barcode scanning.',
        summary: 'Warehouse inventory solution',
        dateRange: { startDate: new Date('2024-11-15'), endDate: new Date('2025-01-15') },
        status: 'ongoing',
        statusLabel: 'Active',
        clientId: maryam,
        clientName: 'Maryam Hassan',
        clientVerified: true,
        freelancerId: ibrahim,
        budget: { amount: 720000, currency: '₦', type: 'fixed' },
        projectType: 'Desktop Application',
        deliverables: ['Desktop App', 'Barcode Scanner', 'Reports Module', 'User Manual'],
        milestones: [
          { title: 'Design & Planning', status: 'completed', dueDate: new Date('2024-11-25'), amount: 120000 },
          { title: 'Core Development', status: 'in-progress', dueDate: new Date('2024-12-20'), amount: 400000 },
          { title: 'Testing & Launch', status: 'pending', dueDate: new Date('2025-01-15'), amount: 200000 }
        ],
        createdAt: new Date('2024-11-10'),
        updatedAt: new Date('2024-11-25')
      }
    ];

    for (const project of projectsData) {
      const existing = await db.collection('projects').findOne({ title: project.title });
      if (!existing) {
        await db.collection('projects').insertOne(project);
        console.log(`  ✅ Created project: ${project.title}`);
      } else {
        console.log(`  ⏭️  Project exists: ${project.title}`);
      }
    }

    // Get created projects for proposals
    const allProjects = await db.collection('projects').find({}).toArray();
    const allJobs = await db.collection('jobs').find({}).toArray();

    // Create Proposals
    console.log('\n📝 Creating proposals...');
    const proposalsCount = await db.collection('proposals').countDocuments();
    if (proposalsCount === 0) {
      const proposalsData = [];
      
      // Create proposals for jobs
      allJobs.slice(0, 3).forEach((job, index) => {
        const freelancers = [usman, aisha, ibrahim];
        freelancers.forEach((freelancerId, fIndex) => {
          proposalsData.push({
            jobId: job._id,
            freelancerId: freelancerId,
            clientId: job.clientId,
            coverLetter: `I am very interested in this ${job.title} position. I have ${3 + fIndex} years of experience in ${job.skills[0]} and have successfully completed similar projects. I can deliver high-quality work within your timeline.`,
            proposedBudget: job.budget * (0.85 + (fIndex * 0.05)),
            estimatedDuration: job.duration,
            status: index === 0 && fIndex === 0 ? 'accepted' : (fIndex === 2 ? 'rejected' : 'pending'),
            createdAt: new Date(Date.now() - (10 - index - fIndex) * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - (8 - index - fIndex) * 24 * 60 * 60 * 1000)
          });
        });
      });

      await db.collection('proposals').insertMany(proposalsData);
      console.log(`  ✅ Created ${proposalsData.length} proposals`);
    } else {
      console.log(`  ⏭️  ${proposalsCount} proposals already exist`);
    }

    // Create Payments
    console.log('\n💰 Creating payments...');
    const paymentsData = [
      {
        projectId: allProjects[0]?._id,
        senderId: ahmad,
        receiverId: usman,
        amount: 850000,
        currency: 'NGN',
        status: 'completed',
        paymentType: 'project_payment',
        description: 'Final payment for E-commerce Mobile App',
        transactionId: 'TXN' + Date.now() + '001',
        createdAt: new Date('2024-11-16'),
        updatedAt: new Date('2024-11-16')
      },
      {
        projectId: allProjects[1]?._id,
        senderId: maryam,
        receiverId: aisha,
        amount: 100000,
        currency: 'NGN',
        status: 'completed',
        paymentType: 'milestone_payment',
        description: 'Design milestone - Corporate Website',
        transactionId: 'TXN' + Date.now() + '002',
        createdAt: new Date('2024-11-12'),
        updatedAt: new Date('2024-11-12')
      },
      {
        projectId: allProjects[2]?._id,
        senderId: ahmad,
        receiverId: ibrahim,
        amount: 120000,
        currency: 'NGN',
        status: 'completed',
        paymentType: 'milestone_payment',
        description: 'Backend milestone - Booking System',
        transactionId: 'TXN' + Date.now() + '003',
        createdAt: new Date('2024-10-28'),
        updatedAt: new Date('2024-10-28')
      },
      {
        projectId: allProjects[3]?._id,
        senderId: yusuf,
        receiverId: aisha,
        amount: 950000,
        currency: 'NGN',
        status: 'completed',
        paymentType: 'project_payment',
        description: 'Full payment - Social Media Dashboard',
        transactionId: 'TXN' + Date.now() + '004',
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2024-12-01')
      },
      {
        projectId: allProjects[4]?._id,
        senderId: maryam,
        receiverId: ibrahim,
        amount: 120000,
        currency: 'NGN',
        status: 'pending',
        paymentType: 'milestone_payment',
        description: 'First milestone - Inventory System',
        transactionId: 'TXN' + Date.now() + '005',
        createdAt: new Date('2024-11-26'),
        updatedAt: new Date('2024-11-26')
      }
    ];

    for (const payment of paymentsData) {
      if (payment.projectId) {
        const existing = await db.collection('payments').findOne({ transactionId: payment.transactionId });
        if (!existing) {
          await db.collection('payments').insertOne(payment);
          console.log(`  ✅ Created payment: ₦${payment.amount.toLocaleString()}`);
        }
      }
    }

    // Create Reviews
    console.log('\n⭐ Creating reviews...');
    const reviewsData = [
      {
        projectId: allProjects[0]?._id,
        reviewerId: ahmad,
        revieweeId: usman,
        rating: 5,
        comment: 'Excellent work! Usman delivered a high-quality mobile app that exceeded our expectations. Professional, timely, and great communication throughout the project.',
        createdAt: new Date('2024-11-17'),
        updatedAt: new Date('2024-11-17')
      },
      {
        projectId: allProjects[3]?._id,
        reviewerId: yusuf,
        revieweeId: aisha,
        rating: 5,
        comment: 'Aisha did an amazing job on our social media dashboard. The UI is beautiful and the functionality is exactly what we needed. Highly recommend!',
        createdAt: new Date('2024-12-02'),
        updatedAt: new Date('2024-12-02')
      },
      {
        projectId: allProjects[0]?._id,
        reviewerId: usman,
        revieweeId: ahmad,
        rating: 5,
        comment: 'Great client to work with. Clear requirements, prompt payments, and excellent communication. Would love to work together again!',
        createdAt: new Date('2024-11-18'),
        updatedAt: new Date('2024-11-18')
      },
      {
        projectId: allProjects[2]?._id,
        reviewerId: ahmad,
        revieweeId: ibrahim,
        rating: 4,
        comment: 'Good work on the booking system. Ibrahim is skilled and delivered quality code. Minor delays but overall satisfied with the outcome.',
        createdAt: new Date('2024-11-26'),
        updatedAt: new Date('2024-11-26')
      }
    ];

    for (const review of reviewsData) {
      if (review.projectId) {
        const existing = await db.collection('reviews').findOne({ 
          projectId: review.projectId,
          reviewerId: review.reviewerId 
        });
        if (!existing) {
          await db.collection('reviews').insertOne(review);
          console.log(`  ✅ Created review: ${review.rating}★`);
        }
      }
    }

    // Create Contracts
    console.log('\n�� Creating contracts...');
    const contractsData = [
      {
        clientId: ahmad,
        freelancerId: usman,
        projectId: allProjects[0]?._id,
        title: 'E-commerce Mobile App Development Contract',
        terms: 'Development of mobile application as specified in project requirements. Payment upon milestone completion. Project duration: 3 months.',
        amount: 850000,
        startDate: new Date('2024-08-15'),
        endDate: new Date('2024-11-15'),
        status: 'completed',
        signedByClient: true,
        signedByFreelancer: true,
        createdAt: new Date('2024-08-14'),
        updatedAt: new Date('2024-11-15')
      },
      {
        clientId: maryam,
        freelancerId: aisha,
        projectId: allProjects[1]?._id,
        title: 'Corporate Website Redesign Contract',
        terms: 'Website redesign with CMS integration and SEO optimization. Monthly progress reviews. Payment in milestones.',
        amount: 450000,
        startDate: new Date('2024-11-01'),
        endDate: new Date('2024-12-15'),
        status: 'active',
        signedByClient: true,
        signedByFreelancer: true,
        createdAt: new Date('2024-10-30'),
        updatedAt: new Date('2024-11-25')
      },
      {
        clientId: ahmad,
        freelancerId: ibrahim,
        projectId: allProjects[2]?._id,
        title: 'Restaurant Booking System Contract',
        terms: 'Development of web-based booking system. Includes testing and deployment. Support period: 30 days post-launch.',
        amount: 320000,
        startDate: new Date('2024-10-10'),
        endDate: new Date('2024-12-10'),
        status: 'active',
        signedByClient: true,
        signedByFreelancer: true,
        createdAt: new Date('2024-10-09'),
        updatedAt: new Date('2024-11-25')
      },
      {
        clientId: yusuf,
        freelancerId: aisha,
        projectId: allProjects[3]?._id,
        title: 'Social Media Dashboard Contract',
        terms: 'Complete social media management dashboard with analytics. Training included. Lifetime license.',
        amount: 950000,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-11-30'),
        status: 'completed',
        signedByClient: true,
        signedByFreelancer: true,
        createdAt: new Date('2024-08-31'),
        updatedAt: new Date('2024-11-30')
      },
      {
        clientId: maryam,
        freelancerId: ibrahim,
        title: 'Inventory Management System Contract',
        terms: 'Custom inventory system development. Includes training and documentation. 6 months support included.',
        amount: 720000,
        startDate: new Date('2024-11-15'),
        endDate: new Date('2025-01-15'),
        status: 'pending_signature',
        signedByClient: true,
        signedByFreelancer: false,
        createdAt: new Date('2024-11-14'),
        updatedAt: new Date('2024-11-14')
      }
    ];

    for (const contract of contractsData) {
      const existing = await db.collection('contracts').findOne({ 
        clientId: contract.clientId,
        freelancerId: contract.freelancerId,
        title: contract.title
      });
      if (!existing) {
        await db.collection('contracts').insertOne(contract);
        console.log(`  ✅ Created contract: ${contract.title}`);
      }
    }

    // Create Notifications
    console.log('\n🔔 Creating notifications...');
    const notificationsData = [
      {
        userId: ahmad,
        type: 'payment',
        title: 'Payment Successful',
        message: 'Your payment of ₦850,000 to Usman Garba was successful',
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        userId: usman,
        type: 'payment_received',
        title: 'Payment Received',
        message: 'You received ₦850,000 from Ahmad Ibrahim for E-commerce Mobile App',
        read: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        userId: maryam,
        type: 'proposal',
        title: 'New Proposal Received',
        message: 'Aisha Bello submitted a proposal for your Mobile App UI/UX Designer job',
        read: false,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
      },
      {
        userId: aisha,
        type: 'project',
        title: 'Project Milestone Completed',
        message: 'Design milestone for Corporate Website Redesign has been marked as complete',
        read: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        userId: ibrahim,
        type: 'review',
        title: 'New Review Received',
        message: 'Ahmad Ibrahim left you a 4-star review for Restaurant Booking System',
        read: false,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
      },
      {
        userId: yusuf,
        type: 'contract',
        title: 'Contract Signed',
        message: 'Aisha Bello has signed the contract for Social Media Dashboard',
        read: true,
        createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000)
      }
    ];

    for (const notification of notificationsData) {
      await db.collection('notifications').insertOne(notification);
    }
    console.log(`  ✅ Created ${notificationsData.length} notifications`);

    // Summary
    console.log('\n📊 DATABASE SEEDING SUMMARY');
    console.log('═══════════════════════════════════════');
    const counts = {
      users: await db.collection('users').countDocuments(),
      projects: await db.collection('projects').countDocuments(),
      jobs: await db.collection('jobs').countDocuments(),
      proposals: await db.collection('proposals').countDocuments(),
      payments: await db.collection('payments').countDocuments(),
      contracts: await db.collection('contracts').countDocuments(),
      reviews: await db.collection('reviews').countDocuments(),
      notifications: await db.collection('notifications').countDocuments()
    };

    Object.entries(counts).forEach(([key, count]) => {
      console.log(`  ${key.padEnd(15)}: ${count}`);
    });
    console.log('═══════════════════════════════════════\n');

    await mongoose.connection.close();
    console.log('✅ Database seeding completed successfully!\n');

  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
