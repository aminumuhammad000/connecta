// Get user IDs first
const usman = db.users.findOne({ email: 'usman.garba@example.com' });
const ahmad = db.users.findOne({ email: { $regex: /ahmad/i } });
const maryam = db.users.findOne({ email: { $regex: /maryam/i } });

if (!usman) {
  print('❌ Usman not found. Creating user first...');
  db.users.insertOne({
    firstName: 'Usman',
    lastName: 'Garba',
    email: 'usman.garba@example.com',
    password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    userType: 'freelancer',
    phoneNumber: '+2348123456789',
    location: 'Kano, Nigeria',
    isActive: true,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

if (!ahmad) {
  print('Creating Ahmad Ibrahim...');
  db.users.insertOne({
    firstName: 'Ahmad',
    lastName: 'Ibrahim',
    email: 'ahmad.ibrahim@example.com',
    password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    userType: 'client',
    phoneNumber: '+2348111111111',
    location: 'Lagos, Nigeria',
    isActive: true,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

if (!maryam) {
  print('Creating Maryam Hassan...');
  db.users.insertOne({
    firstName: 'Maryam',
    lastName: 'Hassan',
    email: 'maryam.hassan@example.com',
    password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    userType: 'client',
    phoneNumber: '+2348222222222',
    location: 'Abuja, Nigeria',
    isActive: true,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

// Refresh user references
const usmanUser = db.users.findOne({ email: 'usman.garba@example.com' });
const ahmadUser = db.users.findOne({ email: 'ahmad.ibrahim@example.com' });
const maryamUser = db.users.findOne({ email: 'maryam.hassan@example.com' });

print('Found users:');
print('Usman ID:', usmanUser._id);
print('Ahmad ID:', ahmadUser._id);
print('Maryam ID:', maryamUser._id);

// Insert projects
const projects = [
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
    clientId: ahmadUser._id,
    clientName: 'Ahmad Ibrahim',
    clientVerified: true,
    freelancerId: usmanUser._id,
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
    createdAt: new Date('2024-08-10'),
    updatedAt: new Date('2024-11-15')
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
    clientId: maryamUser._id,
    clientName: 'Maryam Hassan',
    clientVerified: true,
    freelancerId: usmanUser._id,
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
    createdAt: new Date('2024-10-25'),
    updatedAt: new Date('2024-11-25')
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
    clientId: ahmadUser._id,
    clientName: 'Ahmad Ibrahim',
    clientVerified: true,
    freelancerId: usmanUser._id,
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
    createdAt: new Date('2024-10-05'),
    updatedAt: new Date('2024-11-25')
  }
];

print('\n📦 Inserting projects...');
projects.forEach(project => {
  const existing = db.projects.findOne({ title: project.title });
  if (!existing) {
    db.projects.insertOne(project);
    print('✅ Created:', project.title);
  } else {
    print('⏭️  Already exists:', project.title);
  }
});

print('\n📊 Summary:');
print('Total projects:', db.projects.countDocuments());
print('Usman projects:', db.projects.countDocuments({ freelancerId: usmanUser._id }));
