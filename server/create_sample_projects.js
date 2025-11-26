const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./src/models/user.model');
const Project = require('./src/models/Project.model').default;
const Proposal = require('./src/models/Proposal.model').default;
const Payment = require('./src/models/Payment.model').default;

async function createSampleData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find or create Usman Garba
    let usman = await User.findOne({ email: 'usman.garba@example.com' });
    if (!usman) {
      console.log('Creating Usman Garba...');
      usman = new User({
        firstName: 'Usman',
        lastName: 'Garba',
        email: 'usman.garba@example.com',
        password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        userType: 'freelancer',
        phoneNumber: '+2348123456789',
        location: 'Kano, Nigeria',
        skills: ['Web Development', 'Mobile Apps', 'UI/UX Design', 'React Native'],
        bio: 'Experienced full-stack developer specializing in React, Node.js, and mobile app development.',
        hourlyRate: 15000,
        availability: 'available',
        isActive: true,
        isEmailVerified: true
      });
      await usman.save();
    }
    console.log('Found Usman:', usman.firstName, usman.lastName);

    // Create client users
    let client1 = await User.findOne({ email: 'ahmad.ibrahim@example.com' });
    if (!client1) {
      client1 = new User({
        firstName: 'Ahmad',
        lastName: 'Ibrahim',
        email: 'ahmad.ibrahim@example.com',
        password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        userType: 'client',
        phoneNumber: '+2348111111111',
        location: 'Lagos, Nigeria',
        isActive: true,
        isEmailVerified: true
      });
      await client1.save();
      console.log('✅ Created client: Ahmad Ibrahim');
    }

    let client2 = await User.findOne({ email: 'maryam.hassan@example.com' });
    if (!client2) {
      client2 = new User({
        firstName: 'Maryam',
        lastName: 'Hassan',
        email: 'maryam.hassan@example.com',
        password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        userType: 'client',
        phoneNumber: '+2348222222222',
        location: 'Abuja, Nigeria',
        isActive: true,
        isEmailVerified: true
      });
      await client2.save();
      console.log('✅ Created client: Maryam Hassan');
    }

    // Create projects
    const projectsData = [
      {
        title: 'E-commerce Mobile App Development',
        description: 'Build a React Native mobile app for online marketplace with payment integration, user authentication, and real-time notifications. Features include product catalog, shopping cart, order management, and user reviews.',
        summary: 'Full-featured e-commerce mobile application with payment integration',
        dateRange: {
          startDate: new Date('2024-08-15'),
          endDate: new Date('2024-11-15')
        },
        status: 'completed',
        statusLabel: 'Completed',
        clientId: client1._id,
        clientName: `${client1.firstName} ${client1.lastName}`,
        clientVerified: true,
        freelancerId: usman._id,
        budget: {
          amount: 850000,
          currency: '₦',
          type: 'fixed'
        },
        projectType: 'Mobile App Development',
        deliverables: [
          'iOS and Android mobile applications',
          'Admin dashboard for product management',
          'Payment gateway integration (Paystack)',
          'Push notification system',
          'User authentication and authorization',
          'API documentation'
        ],
        milestones: [
          {
            title: 'UI/UX Design and Wireframes',
            status: 'completed',
            dueDate: new Date('2024-09-01'),
            amount: 150000
          },
          {
            title: 'Frontend Development',
            status: 'completed',
            dueDate: new Date('2024-10-01'),
            amount: 350000
          },
          {
            title: 'Backend API and Integration',
            status: 'completed',
            dueDate: new Date('2024-10-20'),
            amount: 250000
          },
          {
            title: 'Testing and Deployment',
            status: 'completed',
            dueDate: new Date('2024-11-15'),
            amount: 100000
          }
        ],
        createdAt: new Date('2024-08-10')
      },
      {
        title: 'Corporate Website Redesign',
        description: 'Modern, responsive website redesign with improved UX, SEO optimization, and CMS integration for content management. Includes homepage, about, services, portfolio, blog, and contact pages.',
        summary: 'Professional corporate website with CMS and SEO optimization',
        dateRange: {
          startDate: new Date('2024-11-01'),
          endDate: new Date('2024-12-15')
        },
        status: 'ongoing',
        statusLabel: 'In Progress',
        clientId: client2._id,
        clientName: `${client2.firstName} ${client2.lastName}`,
        clientVerified: true,
        freelancerId: usman._id,
        budget: {
          amount: 450000,
          currency: '₦',
          type: 'fixed'
        },
        projectType: 'Web Development',
        deliverables: [
          'Responsive website design (desktop, tablet, mobile)',
          'Content Management System integration',
          'SEO optimization',
          'Blog system',
          'Contact form with email notifications',
          'Admin training and documentation'
        ],
        milestones: [
          {
            title: 'Design Mockups and Approval',
            status: 'completed',
            dueDate: new Date('2024-11-10'),
            amount: 100000
          },
          {
            title: 'Frontend Development',
            status: 'in-progress',
            dueDate: new Date('2024-11-25'),
            amount: 200000
          },
          {
            title: 'CMS Integration and Content Migration',
            status: 'pending',
            dueDate: new Date('2024-12-05'),
            amount: 100000
          },
          {
            title: 'Testing and Launch',
            status: 'pending',
            dueDate: new Date('2024-12-15'),
            amount: 50000
          }
        ],
        createdAt: new Date('2024-10-25')
      },
      {
        title: 'Restaurant Booking System',
        description: 'Web-based reservation system with table management, customer notifications, and admin dashboard. Features real-time availability, automated reminders, and analytics.',
        summary: 'Complete restaurant reservation and table management system',
        dateRange: {
          startDate: new Date('2024-10-10'),
          endDate: new Date('2024-12-10')
        },
        status: 'ongoing',
        statusLabel: 'Active',
        clientId: client1._id,
        clientName: `${client1.firstName} ${client1.lastName}`,
        clientVerified: true,
        freelancerId: usman._id,
        budget: {
          amount: 320000,
          currency: '₦',
          type: 'fixed'
        },
        projectType: 'Web Application',
        deliverables: [
          'Customer-facing booking interface',
          'Admin dashboard for table management',
          'Real-time availability calendar',
          'Email and SMS notifications',
          'Reporting and analytics',
          'Mobile-responsive design'
        ],
        milestones: [
          {
            title: 'Database Design and API Development',
            status: 'completed',
            dueDate: new Date('2024-10-25'),
            amount: 100000
          },
          {
            title: 'Frontend Development',
            status: 'in-progress',
            dueDate: new Date('2024-11-15'),
            amount: 120000
          },
          {
            title: 'Admin Dashboard',
            status: 'pending',
            dueDate: new Date('2024-11-30'),
            amount: 70000
          },
          {
            title: 'Testing and Deployment',
            status: 'pending',
            dueDate: new Date('2024-12-10'),
            amount: 30000
          }
        ],
        createdAt: new Date('2024-10-05')
      }
    ];

    console.log('\n📦 Creating projects...');
    for (const projData of projectsData) {
      const existing = await Project.findOne({ title: projData.title });
      if (!existing) {
        const project = new Project(projData);
        await project.save();
        console.log(`✅ Created: ${project.title}`);
      } else {
        console.log(`⏭️  Already exists: ${projData.title}`);
      }
    }

    // Count totals
    const totalProjects = await Project.countDocuments();
    const usmanProjects = await Project.countDocuments({ freelancerId: usman._id });

    console.log('\n📊 Summary:');
    console.log(`   Total projects in database: ${totalProjects}`);
    console.log(`   Usman's projects: ${usmanProjects}`);

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createSampleData();
