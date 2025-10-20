import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import JobDetailHeader from './components/JobDetailHeader';
import JobOverview from './components/JobOverview';
import JobDetails from './components/JobDetails';
import ClientInfo from './components/ClientInfo';
import styles from './styles/JobDetail.module.css';

const JobDetail: React.FC = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  // Sample job data - in a real app, this would come from an API based on jobId
  const job = {
    id: jobId || '1',
    title: 'UI/UX Designer for Fintech Screenshot Design',
    postedTime: '31 minutes ago',
    location: 'Worldwide',
    connectsRequired: '8 required Connects (100 available)',
    summary: 'We need a UI/Ux designer to create one professional screenshot design for our fintech mobile app. This screenshot will be used for app store presentation and marketing purposes. The design should showcase the app\'s key features and functionality in a visually appealing way. We\'re looking for a single, high-quality mobile app screenshot that captures the essence of our fintech application. The design should be modern, professional, and suitable for fintech industry standards. Please ensure the screenshot is clean, visually appealing, and ready for presentation. Source files should be provided in Figma.',
    budget: '₦ 150,000',
    budgetType: 'Fixed-price',
    experienceLevel: 'Entry Level',
    projectType: 'One-time project',
    requirements: [
      'Experience with fintech or financial app design',
      'Strong mobile UI/UX portfolio',
      'Proficiency in Figma',
      'Please share your portfolio with relevant fintech or mobile app examples',
      'Confirm your availability for this project'
    ],
    deliverables: [
      'Figma design for responsive landing page',
      'Hero banner with call-to-action'
    ],
    mandatorySkills: ['Graphics Design'],
    niceToHaveSkills: ['Logo Design', 'Adobe Illustrator'],
    tools: ['Adobe Photoshop', 'Adobe Illustrator', 'Figma'],
    proposals: '10 to 15',
    interviewing: '0',
    invitesSent: '0',
    unansweredInvites: '0',
    client: {
      paymentVerified: true,
      rating: 5.0,
      totalReviews: 26,
      location: 'Nigeria',
      state: 'kano state',
      time: '11:20 AM',
      jobsPosted: '50 jobs posted',
      totalSpent: '₦500,000 total spent',
      hireRate: '60% hire rate',
      jobsInProgress: [
        {
          title: 'Metabase Dashboard Builder - Domain Sales',
          freelancer: 'Freelancer Aminu Muhammad',
          period: 'Oct 2025 - present',
          type: 'Fixed-price'
        }
      ],
      recentHistory: [
        {
          title: '30 minute consultation',
          rating: 5.0,
          review: 'Great energy and positive vibe! I\'m really excited to be in his corner, highly recommended!',
          freelancer: 'Aminu Muhammad',
          period: 'Sep 2025 - Oct 2025',
          type: 'Fixed-price ₦ 150,000'
        }
      ]
    }
  };

  return (
    <div className={styles.jobDetail}>
      <JobDetailHeader 
        jobTitle={job.title}
        onBack={() => navigate('/dashboard')}
        onShare={() => console.log('Share job')}
        onSave={() => console.log('Save job')}
      />
      
      <div className={styles.content}>
        <JobOverview job={job} />
        <JobDetails job={job} />
        <ClientInfo client={job.client} />
      </div>
    </div>
  );
};

export default JobDetail;
