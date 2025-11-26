const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/user.model');
const Project = require('./src/models/project.model');
const Proposal = require('./src/models/proposal.model');
const Payment = require('./src/models/payment.model');

async function addUsmanData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find Usman Garba
    const usman = await User.findOne({ email: 'usman.garba@example.com' });
    if (!usman) {
      console.log('Creating Usman Garba user...');
      const newUser = new User({
        firstName: 'Usman',
        lastName: 'Garba',
        email: 'usman.garba@example.com',
        password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // password123
        userType: 'freelancer',
        phoneNumber: '+2348123456789',
        location: 'Kano, Nigeria',
        skills: ['Web Development', 'Mobile Apps', 'UI/UX Design', 'React Native'],
        bio: 'Experienced full-stack developer specializing in React, Node.js, and mobile app development. 5+ years building scalable web applications.',
        hourlyRate: 15000,
        availability: 'available',
        isActive: true,
        isEmailVerified: true
      });
      await newUser.save();
      usman = newUser;
      console.log('✅ Usman Garba created');
    }

    console.log('Found Usman:', usman.firstName, usman.lastName, usman._id);

    // Create some client users for projects
    let client1 = await User.findOne({ email: 'client1@example.com' });
    if (!client1) {
      client1 = new User({
        firstName: 'Ahmad',
        lastName: 'Ibrahim',
        email: 'client1@example.com',
        password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        userType: 'client',
        phoneNumber: '+2348111111111',
        location: 'Lagos, Nigeria',
        isActive: true,
        isEmailVerified: true
      });
      await client1.save();
    }

    let client2 = await User.findOne({ email: 'client2@example.com' });
    if (!client2) {
      client2 = new User({
        firstName: 'Maryam',
        lastName: 'Hassan',
        email: 'client2@example.com',
        password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        userType: 'client',
        phoneNumber: '+2348222222222',
        location: 'Abuja, Nigeria',
        isActive: true,
        isEmailVerified: true
      });
      await client2.save();
    }

    // Create 3 projects
    const projects = [
      {
        title: 'E-commerce Mobile App Development',
        description: 'Build a React Native mobile app for online marketplace with payment integration, user authentication, and real-time notifications.',
        clientId: client1._id,
        freelancerId: usman._id,
        budget: 850000,
        status: 'completed',
        category: 'Mobile Development',
        skillsRequired: ['React Native', 'Node.js', 'MongoDB', 'Payment Integration'],
        duration: '3 months',
        startDate: new Date('2024-08-15'),
        endDate: new Date('2024-11-15'),
        createdAt: new Date('2024-08-10')
      },
      {
        title: 'Corporate Website Redesign',
        description: 'Modern, responsive website redesign with improved UX, SEO optimization, and CMS integration for content management.',
        clientId: client2._id,
        freelancerId: usman._id,
        budget: 450000,
        status: 'in_progress',
        category: 'Web Development',
        skillsRequired: ['React', 'Tailwind CSS', 'Next.js', 'SEO'],
        duration: '6 weeks',
        startDate: new Date('2024-11-01'),
        createdAt: new Date('2024-10-25')
      },
      {
        title: 'Restaurant Booking System',
        description: 'Web-based reservation system with table management, customer notifications, and admin dashboard.',
        clientId: client1._id,
        freelancerId: usman._id,
        budget: 320000,
        status: 'active',
        category: 'Web Development',
        skillsRequired: ['React', 'Node.js', 'Express', 'PostgreSQL'],
        duration: '2 months',
        startDate: new Date('2024-10-10'),
        createdAt: new Date('2024-10-05')
      }
    ];

    console.log('\nCreating projects...');
    const createdProjects = [];
    for (const proj of projects) {
      const existing = await Project.findOne({ title: proj.title, freelancerId: usman._id });
      if (!existing) {
        const project = new Project(proj);
        await project.save();
        createdProjects.push(project);
        console.log('✅ Created project:', project.title);
      } else {
        createdProjects.push(existing);
        console.log('⏭️  Project already exists:', existing.title);
      }
    }

    // Create 5 proposals (2 accepted, 1 rejected, 2 pending)
    const proposalsData = [
      {
        projectId: createdProjects[0]._id,
        freelancerId: usman._id,
        clientId: client1._id,
        coverLetter: 'I have extensive experience building e-commerce mobile applications with React Native. My previous projects include payment gateway integration with Paystack and Flutterwave.',
        proposedBudget: 850000,
        estimatedDuration: '12 weeks',
        status: 'accepted',
        createdAt: new Date('2024-08-12')
      },
      {
        projectId: createdProjects[1]._id,
        freelancerId: usman._id,
        clientId: client2._id,
        coverLetter: 'I specialize in modern web design with focus on user experience and performance. I can deliver a fully responsive website with excellent SEO optimization.',
        proposedBudget: 450000,
        estimatedDuration: '6 weeks',
        status: 'accepted',
        createdAt: new Date('2024-10-26')
      },
      {
        projectId: createdProjects[2]._id,
        freelancerId: usman._id,
        clientId: client1._id,
        coverLetter: 'Perfect fit for this project! I have built similar booking systems with real-time table availability and automated notifications.',
        proposedBudget: 320000,
        estimatedDuration: '8 weeks',
        status: 'accepted',
        createdAt: new Date('2024-10-06')
      }
    ];

    // Add 2 pending proposals for open projects
    const openProject1 = await Project.findOne({ status: 'open' }).limit(1);
    if (openProject1 && !proposalsData.find(p => p.projectId.equals(openProject1._id))) {
      proposalsData.push({
        projectId: openProject1._id,
        freelancerId: usman._id,
        clientId: openProject1.clientId,
        coverLetter: 'I am very interested in this project and believe my skills align perfectly with your requirements. I have successfully completed similar projects.',
        proposedBudget: openProject1.budget * 0.9,
        estimatedDuration: '4 weeks',
        status: 'pending',
        createdAt: new Date('2024-11-20')
      });
    }

    console.log('\nCreating proposals...');
    const createdProposals = [];
    for (const prop of proposalsData) {
      const existing = await Proposal.findOne({ projectId: prop.projectId, freelancerId: usman._id });
      if (!existing) {
        const proposal = new Proposal(prop);
        await proposal.save();
        createdProposals.push(proposal);
        console.log('✅ Created proposal for project:', prop.projectId);
      } else {
        createdProposals.push(existing);
        console.log('⏭️  Proposal already exists');
      }
    }

    // Create payments
    const paymentsData = [
      {
        projectId: createdProjects[0]._id,
        senderId: client1._id,
        receiverId: usman._id,
        amount: 850000,
        currency: 'NGN',
        status: 'completed',
        paymentType: 'project_payment',
        description: 'Payment for E-commerce Mobile App Development',
        transactionId: 'TXN' + Date.now() + '001',
        createdAt: new Date('2024-11-16')
      },
      {
        projectId: createdProjects[1]._id,
        senderId: client2._id,
        receiverId: usman._id,
        amount: 225000, // 50% milestone
        currency: 'NGN',
        status: 'completed',
        paymentType: 'milestone_payment',
        description: 'First milestone - Corporate Website Redesign',
        transactionId: 'TXN' + Date.now() + '002',
        createdAt: new Date('2024-11-10')
      },
      {
        projectId: createdProjects[2]._id,
        senderId: client1._id,
        receiverId: usman._id,
        amount: 160000, // 50% milestone
        currency: 'NGN',
        status: 'completed',
        paymentType: 'milestone_payment',
        description: 'Initial payment - Restaurant Booking System',
        transactionId: 'TXN' + Date.now() + '003',
        createdAt: new Date('2024-10-12')
      }
    ];

    console.log('\nCreating payments...');
    for (const pay of paymentsData) {
      const existing = await Payment.findOne({ transactionId: pay.transactionId });
      if (!existing) {
        const payment = new Payment(pay);
        await payment.save();
        console.log('✅ Created payment:', payment.amount, payment.currency);
      } else {
        console.log('⏭️  Payment already exists');
      }
    }

    // Calculate totals
    const totalProjects = await Project.countDocuments({ freelancerId: usman._id });
    const totalProposals = await Proposal.countDocuments({ freelancerId: usman._id });
    const totalEarnings = await Payment.aggregate([
      { 
        $match: { 
          receiverId: usman._id,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    console.log('\n✨ Mock data created successfully!');
    console.log('📊 Usman Garba Statistics:');
    console.log('   Projects:', totalProjects);
    console.log('   Proposals:', totalProposals);
    console.log('   Payments:', paymentsData.length);
    console.log('   Total Earnings: ₦' + (totalEarnings[0]?.total || 0).toLocaleString('en-NG'));

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addUsmanData();
