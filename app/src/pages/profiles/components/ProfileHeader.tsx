import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/ProfileDetails.module.css';
import userImage from '../../../assets/user.png';

const StarRating = ({ rating = 4.9 }: { rating?: number }) => {
  const fullStars = Math.floor(rating);
  
  return (
    <div className={styles.starRating}>
      {Array(5).fill(0).map((_, i) => (
        <Icon 
          key={i} 
          icon="lucide:star" 
          className={`${styles.star} ${i < fullStars ? styles.starFilled : ''}`}
        />
      ))}
    </div>
  );
};

export const ProfileHeader = () => {
  const navigate = useNavigate();

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  const handleCompleteProfile = () => {
    navigate('/edit-profile');
  };

  return (
    <div className={styles.profileHeader}>
      <div className={styles.profileInfo}>
        <div className={styles.avatarContainer}>
          <img src={userImage} alt="Profile" className={styles.avatar} />
          <button className={styles.editButton} onClick={handleEditProfile}>
            <Icon icon="lucide:pencil" className={styles.editIcon} />
          </button>
        </div>
        <div className={styles.userDetails}>
          <h2 className={styles.userName}>Mustapha Hussein</h2>
          <div className={styles.location}>
            <Icon icon="lucide:map-pin" className={styles.locationIcon} />
            <span>kano, Nigeria</span>
          </div>
          <div className={styles.ratingContainer}>
            <StarRating rating={4.9} />
            <span className={styles.ratingValue}>4.9</span>
          </div>
          <p className={styles.successRate}>Job Success Rate: 98%</p>
        </div>
      </div>
      <div className={styles.profileProgress}>
        <button className={styles.completeButton} onClick={handleCompleteProfile}>
          <span>Complete your profile</span>
          <Icon icon="lucide:chevron-right" className={styles.chevronIcon} />
        </button>
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: '48%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
