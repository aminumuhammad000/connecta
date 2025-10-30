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

type ProfileHeaderProps = {
  name?: string;
  location?: string;
  profileImage?: string;
  rating?: number;
  successRate?: string;
};

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  location,
  profileImage,
  rating = 4.9,
  successRate = '98%'
}) => {
  const navigate = useNavigate();

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  const handleCompleteProfile = () => {
    navigate('/complete-profile');
  };

  const displayName = name || 'Mustapha Hussein';
  const displayLocation = location || 'kano, Nigeria';
  const avatar = profileImage || userImage;

  return (
    <div className={styles.profileHeader}>
      <div className={styles.profileInfo}>
        <div className={styles.avatarContainer}>
          <img src={avatar} alt="Profile" className={styles.avatar} />
          <button className={styles.editButton} onClick={handleEditProfile}>
            <Icon icon="lucide:pencil" className={styles.editIcon} />
          </button>
        </div>
        <div className={styles.userDetails}>
          <h2 className={styles.userName}>{displayName}</h2>
          <div className={styles.location}>
            <Icon icon="lucide:map-pin" className={styles.locationIcon} />
            <span>{displayLocation}</span>
          </div>
          <div className={styles.ratingContainer}>
            <StarRating rating={4.9} />
            <span className={styles.ratingValue}>{rating}</span>
          </div>
          <p className={styles.successRate}>Job Success Rate: {successRate}</p>
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
