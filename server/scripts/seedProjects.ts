import dotenv from 'dotenv';
import connectDB from '../src/config/db.config';
import Project from '../src/models/Project.model';
import User from '../src/models/user.model';

dotenv.config();

const seedProjects = async () => {
  try {
    await connectDB();

    // Clear existing projects
    await Project.deleteMany({});
    console.log('✅ Cleared existing projects');

    // Find or create freelancer
    let freelancer = await User.findOne({ userType: 'freelancer' });
    if (!freelancer) {
      freelancer = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'freelancer@test.com',
        password: '$2b$10$YourHashedPasswordHere',
        userType: 'freelancer',
      });
      console.log('✅ Created freelancer user');
    }

    // Find or create client
    let client = await User.findOne({ userType: 'employer' });
    if (!client) {
      client = await User.create({
        firstName: 'Mustapha',
        lastName: 'Hussein',
        email: 'client@test.com',
        password: '$2b$10$YourHashedPasswordHere',
        userType: 'employer',
      });
      console.log('✅ Created client user');
    }

    const projects = [
      {
        title: 'UI/UX Designer for Fintech Screenshot Design',
        description: 'We need a UI/UX designer to create professional screenshot designs for our fintech mobile app. This will be used for app store presentation and marketing materials.',
        summary: 'We need a UI/UX designer to create one professional screenshot design for our fintech mobile app. This will be used for app store presentation and marketing. You\'ll design a single high-quality mobile app screenshot with a modern, professional fintech aesthetic. The design should be clean, visually appealing, and presentation-ready. One screenshot design with source files in Figma.',
        dateRange: {
          startDate: new Date('2025-10-19'),
          endDate: new Date('2026-01-14'),
        },
        status: 'ongoing' as const,
        statusLabel: 'Active',
        clientId: client._id,
        clientName: 'Mustapha Hussein',
        clientVerified: true,
        freelancerId: freelancer._id,
        budget: {
          amount: 25,
          currency: '$',
          type: 'fixed' as const,
        },
        projectType: 'One-time project',
        deliverables: [
          'Figma design for responsive landing page',
          'Hero banner with call-to-action',
          'Product highlight section',
          'About or brand story section',
          'Contact or newsletter sign-up',
        ],
        activity: [
          {
            date: new Date('2025-10-06'),
            description: 'Project assigned',
          },
          {
            date: new Date('2025-10-08'),
            description: 'Uploaded first draft',
          },
          {
            date: new Date('2025-10-12'),
            description: 'Client approved milestone',
          },
        ],
        uploads: [],
        milestones: [
          {
            title: 'Initial Design Concept',
            status: 'completed' as const,
            dueDate: new Date('2025-10-15'),
            amount: 10,
          },
          {
            title: 'Final Design & Revisions',
            status: 'in-progress' as const,
            dueDate: new Date('2026-01-14'),
            amount: 15,
          },
        ],
      },
      {
        title: 'E-commerce Website Development',
        description: 'Build a full-featured e-commerce website with product catalog, shopping cart, payment integration, and admin dashboard.',
        summary: 'Looking for an experienced full-stack developer to build a complete e-commerce platform from scratch. The website should include user authentication, product management, shopping cart, checkout process with payment gateway integration, and an admin dashboard for managing orders and inventory.',
        dateRange: {
          startDate: new Date('2025-10-15'),
          endDate: new Date('2026-02-15'),
        },
        status: 'ongoing' as const,
        statusLabel: 'Active',
        clientId: client._id,
        clientName: 'Mustapha Hussein',
        clientVerified: true,
        freelancerId: freelancer._id,
        budget: {
          amount: 500,
          currency: '$',
          type: 'fixed' as const,
        },
        projectType: 'Long-term project',
        deliverables: [
          'Responsive frontend with React',
          'Backend API with Node.js/Express',
          'Database design and implementation',
          'Payment gateway integration',
          'Admin dashboard',
          'Deployment and documentation',
        ],
        activity: [
          {
            date: new Date('2025-10-15'),
            description: 'Project kickoff meeting',
          },
          {
            date: new Date('2025-10-20'),
            description: 'Database schema approved',
          },
          {
            date: new Date('2025-10-25'),
            description: 'Frontend prototype delivered',
          },
        ],
        uploads: [],
        milestones: [],
      },
      {
        title: 'Mobile App UI Design',
        description: 'Design modern and intuitive UI for a mobile fitness tracking app with workout logging, progress tracking, and social features.',
        summary: 'We need a talented UI designer to create a complete mobile app design for our fitness tracking application. The app should have an engaging, motivational design that encourages daily use. Focus on clean layouts, easy navigation, and vibrant visuals.',
        dateRange: {
          startDate: new Date('2025-10-20'),
          endDate: new Date('2026-01-20'),
        },
        status: 'ongoing' as const,
        statusLabel: 'Active',
        clientId: client._id,
        clientName: 'Mustapha Hussein',
        clientVerified: true,
        freelancerId: freelancer._id,
        budget: {
          amount: 150,
          currency: '$',
          type: 'fixed' as const,
        },
        projectType: 'One-time project',
        deliverables: [
          'Complete UI design in Figma',
          'User flow diagrams',
          'Interactive prototype',
          'Icon set and visual assets',
          'Design system documentation',
        ],
        activity: [
          {
            date: new Date('2025-10-20'),
            description: 'Project started',
          },
          {
            date: new Date('2025-10-23'),
            description: 'Initial wireframes approved',
          },
        ],
        uploads: [],
        milestones: [],
      },
      {
        title: 'Content Writing for Tech Blog',
        description: 'Write engaging technical blog posts about software development, AI, cloud computing, and emerging technologies for our tech blog.',
        summary: 'We are looking for a technical content writer to produce high-quality blog articles for our technology blog. Articles should be well-researched, SEO-optimized, and engaging for both technical and non-technical audiences. Topics include web development, mobile apps, AI/ML, and cybersecurity.',
        dateRange: {
          startDate: new Date('2025-09-01'),
          endDate: new Date('2025-12-31'),
        },
        status: 'completed' as const,
        statusLabel: 'Completed',
        clientId: client._id,
        clientName: 'Mustapha Hussein',
        clientVerified: true,
        freelancerId: freelancer._id,
        budget: {
          amount: 200,
          currency: '$',
          type: 'fixed' as const,
        },
        projectType: 'Short-term project',
        deliverables: [
          '10 blog articles (1500-2000 words each)',
          'SEO keyword research',
          'Meta descriptions and titles',
          'Images and graphics sourcing',
          'Two rounds of revisions per article',
        ],
        activity: [
          {
            date: new Date('2025-09-01'),
            description: 'Project started',
          },
          {
            date: new Date('2025-09-15'),
            description: 'First 3 articles submitted',
          },
          {
            date: new Date('2025-10-01'),
            description: 'Mid-project review completed',
          },
          {
            date: new Date('2025-11-15'),
            description: 'All articles delivered',
          },
          {
            date: new Date('2025-12-20'),
            description: 'Final revisions approved',
          },
          {
            date: new Date('2025-12-31'),
            description: 'Project completed successfully',
          },
        ],
        uploads: [],
        milestones: [],
      },
      {
        title: 'Brand Identity Design Package',
        description: 'Create a complete brand identity including logo, color palette, typography, brand guidelines, and marketing materials for a tech startup.',
        summary: 'We need a creative brand designer to develop a comprehensive brand identity for our new tech startup. This includes logo design, color scheme, typography selection, brand guidelines document, business card design, and social media templates. The brand should convey innovation, trust, and professionalism.',
        dateRange: {
          startDate: new Date('2025-08-15'),
          endDate: new Date('2025-10-15'),
        },
        status: 'completed' as const,
        statusLabel: 'Completed',
        clientId: client._id,
        clientName: 'Mustapha Hussein',
        clientVerified: true,
        freelancerId: freelancer._id,
        budget: {
          amount: 350,
          currency: '$',
          type: 'fixed' as const,
        },
        projectType: 'One-time project',
        deliverables: [
          'Logo design (multiple concepts)',
          'Brand color palette',
          'Typography system',
          'Brand guidelines document',
          'Business card design',
          'Letterhead and email signature',
          'Social media templates',
        ],
        activity: [
          {
            date: new Date('2025-08-15'),
            description: 'Project kickoff',
          },
          {
            date: new Date('2025-08-25'),
            description: 'Logo concepts presented',
          },
          {
            date: new Date('2025-09-05'),
            description: 'Final logo approved',
          },
          {
            date: new Date('2025-09-20'),
            description: 'Brand guidelines completed',
          },
          {
            date: new Date('2025-10-10'),
            description: 'All deliverables submitted',
          },
          {
            date: new Date('2025-10-15'),
            description: 'Project completed',
          },
        ],
        uploads: [],
        milestones: [],
      },
      {
        title: 'Video Editing for Marketing Campaign',
        description: 'Edit promotional videos for social media marketing campaign including Instagram Reels, TikTok, and YouTube Shorts.',
        summary: 'We need a skilled video editor to create engaging short-form video content for our social media marketing campaign. Videos should be optimized for each platform (Instagram, TikTok, YouTube Shorts) with attention-grabbing hooks, smooth transitions, and on-brand styling.',
        dateRange: {
          startDate: new Date('2025-07-01'),
          endDate: new Date('2025-09-30'),
        },
        status: 'completed' as const,
        statusLabel: 'Completed',
        clientId: client._id,
        clientName: 'Mustapha Hussein',
        clientVerified: true,
        freelancerId: freelancer._id,
        budget: {
          amount: 180,
          currency: '$',
          type: 'fixed' as const,
        },
        projectType: 'Short-term project',
        deliverables: [
          '20 short-form videos (15-60 seconds each)',
          'Platform-specific optimizations',
          'Captions and text overlays',
          'Background music and sound effects',
          'Thumbnail designs',
        ],
        activity: [
          {
            date: new Date('2025-07-01'),
            description: 'Project started',
          },
          {
            date: new Date('2025-07-20'),
            description: 'First batch (5 videos) delivered',
          },
          {
            date: new Date('2025-08-15'),
            description: 'Second batch (8 videos) delivered',
          },
          {
            date: new Date('2025-09-10'),
            description: 'Final batch (7 videos) delivered',
          },
          {
            date: new Date('2025-09-30'),
            description: 'Project completed',
          },
        ],
        uploads: [],
        milestones: [],
      },
    ];

    const createdProjects = await Project.insertMany(projects);
    console.log(`✅ Successfully seeded ${createdProjects.length} projects`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding projects:', error);
    process.exit(1);
  }
};

seedProjects();
