import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import styles from '../styles/JobCard.module.css';
import verifiedIcon from '../../../assets/verified.png';

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
  const [liked, setLiked] = React.useState(false);
  const [disliked, setDisliked] = React.useState(false);

  const handleCardClick = () => {
    navigate(`/job/${(job as any).id || '1'}`);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent card navigation
    setLiked((s) => !s);
    if (disliked) setDisliked(false);
  };

  const handleDislikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDisliked((s) => !s);
    if (liked) setLiked(false);
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
        <h3 className={styles.jobTitle} style={{fontSize: "23px"}}>{job.title}</h3>
        <div className={styles.actionIcons}>
          <Icon
            icon="mdi:dislike-outline"
            style={{ height: '31px', width: '31px' }}
            className={`${styles.dislikeIcon} ${disliked ? styles.active : ''}`}
            onClick={handleDislikeClick}
          />
          <Icon
            icon="si:heart-line"
            style={{ height: '31px', width: '31px' }}
            className={`${styles.likeIcon} ${liked ? styles.active : ''}`}
            onClick={handleLikeClick}
          />
        </div>
      </div>

      {/* Job Details */}
      <div className={styles.jobDetails}>
        <p className={styles.jobType}>Fixed-price - Entry level - Est. Budget: {job.budget}</p>
        <p className={styles.jobDescription}>
          {job.description}<br />
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
            <img src={verifiedIcon} className={styles.checkIcon} />
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
