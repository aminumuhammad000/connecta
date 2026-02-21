export const JOB_CATEGORIES = [
    {
        id: 'tech',
        label: 'Technology & Programming',
        icon: 'code',
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
        icon: 'design-services',
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
        icon: 'campaign',
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
        icon: 'business',
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
        icon: 'edit',
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
        id: 'hospitality',
        label: 'Hospitality & Events',
        icon: 'restaurant',
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
        icon: 'fitness-center',
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
        icon: 'school',
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
        label: 'Other',
        icon: 'category',
        subcategories: [] // User can enter manual string if selected
    }
];

export const JOB_TYPES = [
    { id: 'full-time', label: 'Full Time' },
    { id: 'part-time', label: 'Part Time' },
    { id: 'contract', label: 'Contract' },
    { id: 'freelance', label: 'Freelance' },
    { id: 'one-time', label: 'One-Time Project' },
    { id: 'monthly', label: 'Monthly Retainer' },
    { id: 'permanent', label: 'Permanent' },
    { id: 'adhoc', label: 'Ad-hoc' }
];

export const LOCATION_SCOPES = [
    { id: 'local', label: 'Within Country (Local)' },
    { id: 'international', label: 'International (Abroad)' }
];

export const LOCATION_TYPES = [
    { id: 'remote', label: 'Remote' },
    { id: 'onsite', label: 'Onsite (Physical)' },
    { id: 'hybrid', label: 'Hybrid' }
];

export const DURATION_TYPES = [
    { id: 'days', label: 'Days' },
    { id: 'weeks', label: 'Weeks' },
    { id: 'months', label: 'Months' },
    { id: 'years', label: 'Years' }
];
