export const JOB_CATEGORIES = [
  {
    id: 'tech',
    label: 'Technology & Programming',
    subcategories: [
      'Web Development',
      'Mobile Development',
      'Software Engineering',
      'Data Science',
      'SaaS Development',
      'DevOps & Cloud',
      'Cybersecurity',
      'Blockchain & Web3',
      'Game Development',
      'QA & Testing',
      'Other IT'
    ]
  },
  {
    id: 'design',
    label: 'Design & Creative',
    subcategories: [
      'Graphic Design',
      'UI/UX Design',
      'Logo & Branding',
      'Illustration',
      '3D Modeling & Rendering',
      'Fashion Design',
      'Interior Design',
      'Product Design',
      'Video Production',
      'Animation',
      'Other Design'
    ]
  },
  {
    id: 'marketing',
    label: 'Marketing & Sales',
    subcategories: [
      'Digital Marketing',
      'Social Media Marketing',
      'SEO & SEM',
      'Content Marketing',
      'Email Marketing',
      'Affiliate Marketing',
      'Market Research',
      'Sales & Business Dev',
      'Public Relations',
      'Brand Strategy',
      'Other Marketing'
    ]
  },
  {
    id: 'business',
    label: 'Business & Finance',
    subcategories: [
      'Business Consulting',
      'Accounting & Bookkeeping',
      'Financial Analysis',
      'Project Management',
      'Virtual Assistant',
      'Data Entry',
      'Legal Consulting',
      'HR & Recruiting',
      'Supply Chain',
      'Other Business'
    ]
  },
  {
    id: 'writing',
    label: 'Writing & Translation',
    subcategories: [
      'Copywriting',
      'Content Writing',
      'Technical Writing',
      'Creative Writing',
      'Translation',
      'Editing & Proofreading',
      'Grant Writing',
      'Resume Writing',
      'Scriptwriting',
      'Other Writing'
    ]
  },
  {
    id: 'security_trades',
    label: 'Security, Facilities & Trades',
    subcategories: [
      'Security Guard / Gateman',
      'Facility Management',
      'Driving & Chauffeur Services',
      'Electrician & Electrical',
      'Plumbing & Fitting',
      'AC & Refrigeration Repair',
      'Carpentry & Woodwork',
      'Cleaning & Janitorial',
      'Gardening & Landscaping',
      'Construction & Masonry',
      'General Maintenance & Artisan'
    ]
  },
  {
    id: 'hospitality',
    label: 'Hospitality & Events',
    subcategories: [
      'Hotel Management',
      'Event Planning',
      'Catering',
      'Tour Guide',
      'Travel Planning',
      'Restaurant Service',
      'Other Hospitality'
    ]
  },
  {
    id: 'health',
    label: 'Health & Fitness',
    subcategories: [
      'Personal Training',
      'Nutrition Consulting',
      'Wellness Coaching',
      'Yoga Instruction',
      'Medical Transcription',
      'Telehealth',
      'Other Health'
    ]
  },
  {
    id: 'education',
    label: 'Education & Training',
    subcategories: [
      'Tutoring',
      'Online Course Creation',
      'Language Instruction',
      'Curriculum Development',
      'Educational Consulting',
      'Other Education'
    ]
  },
  {
    id: 'other',
    label: 'General Services & Other',
    subcategories: [
      'Custom Job Role',
      'Domestic & Home Support',
      'Dispatch & Delivery',
      'Personal Assistance',
      'Warehouse & Logistics',
      'General Physical Labor',
      'Other Uncategorized Role'
    ]
  }
];

export const CATEGORY_SKILLS: Record<string, string[]> = {
  tech: ['AI/ML', 'Angular', 'AWS', 'C#', 'C++', 'Cybersecurity', 'Django', 'Docker', 'Firebase', 'Flask', 'Flutter', 'Go', 'GraphQL', 'Java', 'Jenkins', 'Kotlin', 'Kubernetes', 'Laravel', 'MongoDB', 'Next.js', 'Node.js', 'NoSQL', 'PHP', 'PostgreSQL', 'Python', 'React Native', 'Redis', 'Ruby on Rails', 'Rust', 'SQL', 'Svelte', 'Swift', 'Terraform', 'TypeScript', 'Vue.js'].sort(),
  design: ['3D Modeling', 'Adobe XD', 'After Effects', 'Blender', 'Branding', 'Canva', 'Character Design', 'Figma', 'Game UI', 'Graphic Design', 'Illustrator', 'InDesign', 'Infographics', 'Logo Design', 'Motion Graphics', 'Package Design', 'Photoshop', 'Premiere Pro', 'Print Design', 'Prototyping', 'Sketch', 'Typography', 'UI/UX', 'Vector Art', 'Web Design'].sort(),
  marketing: ['Affiliate Marketing', 'Analytics', 'Brand Identity', 'Content Strategy', 'Copywriting', 'Customer Acquisition', 'Email Marketing', 'Funnel Building', 'Google Ads', 'Growth Hacking', 'Influencer Marketing', 'Market Research', 'Meta Ads', 'PPC', 'Public Relations', 'Retargeting', 'SEO', 'SMS Marketing', 'Social Media', 'TikTok Marketing'].sort(),
  business: ['Accounting', 'Bookkeeping', 'Business Strategy', 'CRM', 'Data Analysis', 'Data Entry', 'Excel', 'Financial Analysis', 'HR', 'Hubspot', 'Legal Research', 'Market Analysis', 'Operations', 'Project Management', 'QuickBooks', 'Risk Management', 'Sales', 'Salesforce', 'Strategic Planning', 'Supply Chain', 'Virtual Assistant', 'Xero'].sort(),
  writing: ['Academic Writing', 'Blog Writing', 'Case Studies', 'Content Writing', 'Copywriting', 'Cover Letters', 'Creative Non-fiction', 'Creative Writing', 'Editing', 'Ghostwriting', 'Grant Writing', 'Press Releases', 'Proofreading', 'Resume Writing', 'Scriptwriting', 'SEO Writing', 'Technical Writing', 'Translation', 'White Papers'].sort(),
  security_trades: ['AC Repair', 'Access Control', 'Building Maintenance', 'Carpentry', 'CCTV Monitoring', 'Dispatch & Delivery', 'Driving', 'Electrical Wiring', 'Facility Management', 'Gatekeeping', 'Generator Repair', 'Housekeeping', 'Masonry', 'Patrol & Inspection', 'Physical Security', 'Plumbing', 'Safety Compliance', 'Sanitation'].sort(),
  education: ['Corporate Training', 'Course Creation', 'Curriculum Design', 'Early Childhood', 'Educational Consulting', 'E-learning', 'Instructional Design', 'Language Teaching', 'LMS', 'Online Teaching', 'Special Education', 'STEM Education', 'Test Prep', 'Tutoring'].sort(),
  health: ['Dietetics', 'Fitness Coaching', 'Healthcare Admin', 'Medical Writing', 'Mental Health', 'Mindfulness', 'Nursing', 'Nutrition', 'Occupational Therapy', 'Personal Training', 'Pharmacy', 'Physical Therapy', 'Sports Nutrition', 'Telehealth', 'Wellness Coaching', 'Yoga'].sort(),
  hospitality: ['Barista', 'Bartending', 'Catering', 'Concierge', 'Culinary Arts', 'Customer Service', 'Event Management', 'Event Planning', 'Front Desk', 'Hotel Management', 'Housekeeping', 'Tourism', 'Tour Guiding', 'Travel Planning'].sort(),
  other: ['Administrative Support', 'Communication', 'Customer Service', 'Dispatch & Logistics', 'Domestic Care', 'Equipment Maintenance', 'Facility Care', 'Gatekeeper Guard', 'General Labor', 'Inventory Management', 'Organization', 'Perimeter Security', 'Problem Solving', 'Supervision', 'Time Management'].sort(),
};
