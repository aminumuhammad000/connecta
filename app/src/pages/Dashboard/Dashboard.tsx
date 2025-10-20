import React from 'react';
import DashboardHeader from './components/DashboardHeader';
import DashboardNav from './components/DashboardNav';
import JobSection from './components/JobSection';
import JobCard from './components/JobCard';
import styles from './styles/Dashboard.module.css';

const Dashboard: React.FC = () => {
  // Sample job data - in a real app, this would come from an API
  const jobs = [
    {
      postedTime: "31 minutes ago",
      title: "UI/UX Designer for Fintech Screenshot...",
      budget: "₦150,000",
      description: "We need a UI/Ux designer to create one professional screenshot design for our..",
      skills: ["Mobile UI Design", "Mobile App Design", "User Interface Design"],
      isPaymentVerified: true,
      amountSpent: "₦200,000",
      rating: 5,
      location: "Kano state",
      proposals: "10 to 15",
      freelancersNeeded: 1
    },
    {
      postedTime: "31 minutes ago",
      title: "UI/UX Designer for Fintech Screenshot...",
      budget: "₦150,000",
      description: "We need a UI/Ux designer to create one professional screenshot design for our..",
      skills: ["Mobile UI Design", "Mobile App Design", "User Interface Design"],
      isPaymentVerified: true,
      amountSpent: "₦200,000",
      rating: 5,
      location: "Kano state",
      proposals: "10 to 15",
      freelancersNeeded: 1
    },
    {
      postedTime: "31 minutes ago",
      title: "UI/UX Designer for Fintech Screenshot...",
      budget: "₦150,000",
      description: "We need a UI/Ux designer to create one professional screenshot design for our..",
      skills: ["Mobile UI Design", "Mobile App Design", "User Interface Design"],
      isPaymentVerified: true,
      amountSpent: "₦200,000",
      rating: 5,
      location: "Kano state",
      proposals: "10 to 15",
      freelancersNeeded: 1
    },
    {
      postedTime: "31 minutes ago",
      title: "UI/UX Designer for Fintech Screenshot...",
      budget: "₦150,000",
      description: "We need a UI/Ux designer to create one professional screenshot design for our..",
      skills: ["Mobile UI Design", "Mobile App Design", "User Interface Design"],
      isPaymentVerified: true,
      amountSpent: "₦200,000",
      rating: 5,
      location: "Kano state",
      proposals: "10 to 15",
      freelancersNeeded: 1
    }
  ];

  return (
    <div className={styles.dashboard}>
      <DashboardHeader />
      <DashboardNav />
      <JobSection />
      
      <div className={styles.jobsList}>
        {jobs.map((job, index) => (
          <JobCard key={index} job={job} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

