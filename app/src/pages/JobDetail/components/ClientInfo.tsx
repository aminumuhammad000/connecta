import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import styles from '../styles/ClientInfo.module.css';

interface ClientInfoProps {
  client: {
    paymentVerified: boolean;
    rating: number;
    totalReviews: number;
    location: string;
    state: string;
    time: string;
    jobsPosted: string;
    totalSpent: string;
    hireRate: string;
    jobsInProgress: Array<{
      title: string;
      freelancer: string;
      period: string;
      type: string;
    }>;
    recentHistory: Array<{
      title: string;
      rating: number;
      review: string;
      freelancer: string;
      period: string;
      type: string;
    }>;
  };
}

const ClientInfo: React.FC<ClientInfoProps> = ({ client }) => {
  const [showJobsInProgress, setShowJobsInProgress] = useState(false);

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
    <div className={styles.clientInfo}>
      <h3 className={styles.sectionTitle}>About the client</h3>
      
      {/* Verification & Rating */}
      <div className={styles.verificationSection}>
        <div className={styles.verificationRow}>
          <Icon icon="material-symbols:check-circle" className={styles.checkIcon} />
          <span className={styles.verificationText}>Payment method verified</span>
        </div>
        
        <div className={styles.ratingRow}>
          {renderStars(client.rating)}
          <span className={styles.ratingValue}>{client.rating}</span>
          <span className={styles.reviewCount}>of {client.totalReviews} reviews</span>
        </div>
      </div>

      {/* Location & Time */}
      <div className={styles.locationSection}>
        <span className={styles.location}>{client.location}</span>
        <span className={styles.stateTime}>{client.state} {client.time}</span>
      </div>

      {/* Client Stats */}
      <div className={styles.statsSection}>
        <span className={styles.stat}>{client.jobsPosted}</span>
        <span className={styles.stat}>{client.totalSpent}</span>
        <span className={styles.stat}>{client.hireRate}</span>
      </div>

      {/* Jobs in Progress */}
      <div className={styles.jobsSection}>
        <div 
          className={styles.jobsHeader}
          onClick={() => setShowJobsInProgress(!showJobsInProgress)}
        >
          <span className={styles.jobsTitle}>Jobs in progress</span>
          <Icon 
            icon={showJobsInProgress ? "material-symbols:keyboard-arrow-up" : "material-symbols:keyboard-arrow-down"} 
            className={styles.dropdownIcon}
          />
        </div>
        
        {showJobsInProgress && (
          <div className={styles.jobsList}>
            {client.jobsInProgress.map((job, index) => (
              <div key={index} className={styles.jobItem}>
                <span className={styles.jobTitle}>{job.title}</span>
                <span className={styles.freelancerLink}>{job.freelancer}</span>
                <span className={styles.jobPeriod}>{job.period}</span>
                <span className={styles.jobType}>{job.type}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent History */}
      <div className={styles.historySection}>
        {client.recentHistory.map((history, index) => (
          <div key={index} className={styles.historyItem}>
            <div className={styles.historyHeader}>
              <span className={styles.historyTitle}>{history.title}</span>
              <div className={styles.historyRating}>
                {renderStars(history.rating)}
                <span className={styles.historyRatingValue}>{history.rating}</span>
              </div>
            </div>
            
            <p className={styles.historyReview}>"{history.review}"</p>
            
            <div className={styles.historyFooter}>
              <span className={styles.historyFreelancer}>To freelancer: <span className={styles.freelancerLink}>{history.freelancer}</span></span>
              <div className={styles.historyFooterRating}>
                {renderStars(history.rating)}
                <span className={styles.historyRatingValue}>{history.rating}</span>
              </div>
            </div>
            
            <div className={styles.historyMeta}>
              <span className={styles.historyPeriod}>{history.period}</span>
              <span className={styles.historyType}>{history.type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientInfo;
