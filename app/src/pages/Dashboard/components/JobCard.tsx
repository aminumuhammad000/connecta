import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import styles from '../styles/JobCard.module.css';

interface JobCardProps {
  job: {
    postedTime: string;
    title: string;
    budget: string;
    description: string;
    skills: string[];
    isPaymentVerified: boolean;
    amountSpent: string;
    rating: number;
    location: string;
    proposals: string;
    freelancersNeeded: number;
  };
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/job/${job.id || '1'}`);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Icon 
        key={index} 
        icon={index < rating ? "material-symbols:star" : "material-symbols:star-outline"} 
        className={styles.star}
      />
    ));
  };

  return (
    <div className={styles.jobCard} onClick={handleCardClick}>
      {/* Top Row */}
      <div className={styles.topRow}>
        <span className={styles.postedTime}>Posted {job.postedTime}</span>
        <span className={styles.aiMatched}>AI matched</span>
      </div>

      {/* Job Title and Actions */}
      <div className={styles.titleRow}>
        <h3 className={styles.jobTitle}>{job.title}</h3>
        <div className={styles.actionIcons}>
          <Icon icon="mdi:dislike-outline" className={styles.dislikeIcon} />
          <Icon icon="si:heart-line" className={styles.likeIcon} />
        </div>
      </div>

      {/* Job Details */}
      <div className={styles.jobDetails}>
        <p className={styles.jobType}>Fixed-price - Entry level - Est. Budget: {job.budget}</p>
        <p className={styles.jobDescription}>
          {job.description}
          <span className={styles.moreLink}> more</span>
        </p>
      </div>

      {/* Skills Tags */}
      <div className={styles.skillsContainer}>
        {job.skills.map((skill, index) => (
          <span key={index} className={styles.skillTag}>
            {skill}
          </span>
        ))}
      </div>

      {/* Client Info and Rating */}
      <div className={styles.clientInfo}>
        <div className={styles.paymentInfo}>
          <div className={styles.verifiedRow}>
            <Icon icon="material-symbols:check-circle" className={styles.checkIcon} />
            <span className={styles.paymentVerified}>Payment verified</span>
          </div>
          <div className={styles.ratingRow}>
            {renderStars(job.rating)}
          </div>
        </div>
        <div className={styles.spentLocation}>
          <div className={styles.amountSpent}>{job.amountSpent} Spent</div>
          <div className={styles.locationRow}>
            <Icon icon="material-symbols:location-on" className={styles.locationIcon} />
            <span className={styles.location}>{job.location}</span>
          </div>
        </div>
      </div>

      {/* Application Stats */}
      <div className={styles.applicationStats}>
        <span className={styles.proposals}>Proposals: {job.proposals}</span>
        <span className={styles.freelancersNeeded}>
          Number of freelancers needed: {job.freelancersNeeded}
        </span>
      </div>
    </div>
  );
};

export default JobCard;
