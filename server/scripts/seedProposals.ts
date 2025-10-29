import dotenv from 'dotenv';
import connectDB from '../src/config/db.config';
import Proposal from '../src/models/Proposal.model';
import User from '../src/models/user.model';

dotenv.config();

const seedProposals = async () => {
  try {
    await connectDB();

    // Clear existing proposals
    await Proposal.deleteMany({});
    console.log('✅ Cleared existing proposals');

    // Find a freelancer user (or create one if doesn't exist)
    let freelancer = await User.findOne({ userType: 'freelancer' });
    
    if (!freelancer) {
      freelancer = await User.create({
        firstName: 'John',
        lastName: 'Freelancer',
        email: 'freelancer@test.com',
        password: '$2b$10$YourHashedPasswordHere', // You should hash this properly
        userType: 'freelancer',
      });
      console.log('✅ Created freelancer user');
    }

    // Find referrer user (or create one)
    let referrer = await User.findOne({ firstName: 'Usman' });
    
    if (!referrer) {
      referrer = await User.create({
        firstName: 'Usman',
        lastName: 'Umar',
        email: 'usman@test.com',
        password: '$2b$10$YourHashedPasswordHere',
        userType: 'freelancer',
      });
      console.log('✅ Created referrer user');
    }

    // Create sample proposals
    const proposals = [
      {
        title: 'UI/UX Designer for Fintech Screenshot',
        recommended: true,
        description: 'Lorem ipsum dolor sit amet consectetur. A et duis mattis vitae enim egestas risus nec. Arcu in velit hac tincidunt quam. Massa gravida velit etiam congue sodales aenean eget.',
        budget: {
          amount: 150000,
          currency: '₦',
        },
        dateRange: {
          startDate: new Date('2025-10-15'),
          endDate: new Date('2026-01-14'),
        },
        type: 'recommendation' as const,
        freelancerId: freelancer._id,
        status: 'pending' as const,
        level: 'entry' as const,
        priceType: 'fixed' as const,
      },
      {
        title: 'Mobile App Developer for E-commerce Platform',
        recommended: true,
        description: 'We are looking for an experienced mobile app developer to build a cross-platform e-commerce application. The app should support both iOS and Android platforms with a modern UI/UX design.',
        budget: {
          amount: 250000,
          currency: '₦',
        },
        dateRange: {
          startDate: new Date('2025-11-01'),
          endDate: new Date('2026-02-28'),
        },
        type: 'recommendation' as const,
        freelancerId: freelancer._id,
        status: 'pending' as const,
        level: 'intermediate' as const,
        priceType: 'fixed' as const,
      },
      {
        title: 'Frontend Developer for SaaS Dashboard',
        recommended: true,
        description: 'Need a skilled frontend developer to create a responsive dashboard for our SaaS product. Must have experience with React, TypeScript, and modern CSS frameworks.',
        budget: {
          amount: 180000,
          currency: '₦',
        },
        dateRange: {
          startDate: new Date('2025-10-20'),
          endDate: new Date('2025-12-20'),
        },
        type: 'recommendation' as const,
        freelancerId: freelancer._id,
        status: 'pending' as const,
        level: 'intermediate' as const,
        priceType: 'fixed' as const,
      },
      {
        title: 'Graphic Designer for Brand Identity',
        recommended: true,
        description: 'Looking for a creative graphic designer to develop a complete brand identity including logo, color palette, typography, and brand guidelines for a tech startup.',
        budget: {
          amount: 120000,
          currency: '₦',
        },
        dateRange: {
          startDate: new Date('2025-10-25'),
          endDate: new Date('2025-11-25'),
        },
        type: 'recommendation' as const,
        freelancerId: freelancer._id,
        status: 'pending' as const,
        level: 'entry' as const,
        priceType: 'fixed' as const,
      },
      {
        title: 'Full Stack Developer for Marketplace Platform',
        recommended: false,
        description: 'Seeking a full stack developer to build a marketplace platform with payment integration, user authentication, and real-time messaging features.',
        budget: {
          amount: 350000,
          currency: '₦',
        },
        dateRange: {
          startDate: new Date('2025-11-05'),
          endDate: new Date('2026-03-05'),
        },
        type: 'referral' as const,
        referredBy: referrer._id,
        referredByName: 'Usman Umar',
        freelancerId: freelancer._id,
        status: 'pending' as const,
        level: 'expert' as const,
        priceType: 'fixed' as const,
      },
      {
        title: 'Content Writer for Tech Blog',
        recommended: false,
        description: 'We need a technical content writer to create engaging blog posts about software development, AI, and emerging technologies. Must have strong writing skills and technical knowledge.',
        budget: {
          amount: 80000,
          currency: '₦',
        },
        dateRange: {
          startDate: new Date('2025-10-18'),
          endDate: new Date('2025-12-18'),
        },
        type: 'referral' as const,
        referredBy: referrer._id,
        referredByName: 'Usman Umar',
        freelancerId: freelancer._id,
        status: 'pending' as const,
        level: 'entry' as const,
        priceType: 'fixed' as const,
      },
      {
        title: 'Video Editor for Marketing Content',
        recommended: false,
        description: 'Looking for a skilled video editor to create engaging marketing videos for social media platforms. Experience with Adobe Premiere Pro and After Effects required.',
        budget: {
          amount: 95000,
          currency: '₦',
        },
        dateRange: {
          startDate: new Date('2025-10-22'),
          endDate: new Date('2025-11-22'),
        },
        type: 'referral' as const,
        referredBy: referrer._id,
        referredByName: 'Usman Umar',
        freelancerId: freelancer._id,
        status: 'pending' as const,
        level: 'intermediate' as const,
        priceType: 'fixed' as const,
      },
      {
        title: 'DevOps Engineer for Cloud Infrastructure',
        recommended: true,
        description: 'Need an experienced DevOps engineer to set up and manage cloud infrastructure on AWS. Must have experience with Docker, Kubernetes, and CI/CD pipelines.',
        budget: {
          amount: 280000,
          currency: '₦',
        },
        dateRange: {
          startDate: new Date('2025-11-10'),
          endDate: new Date('2026-01-10'),
        },
        type: 'recommendation' as const,
        freelancerId: freelancer._id,
        status: 'pending' as const,
        level: 'expert' as const,
        priceType: 'fixed' as const,
      },
    ];

    const createdProposals = await Proposal.insertMany(proposals);
    console.log(`✅ Successfully seeded ${createdProposals.length} proposals`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding proposals:', error);
    process.exit(1);
  }
};

seedProposals();
