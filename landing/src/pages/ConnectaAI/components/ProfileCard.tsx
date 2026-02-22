import { Icon } from '@iconify/react';
import styles from './ProfileCard.module.css';

export interface Profile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType?: string;
  skills?: string[];
  bio?: string;
  hourlyRate?: number;
  profileImage?: string;
  location?: string;
  experience?: string;
  rating?: number;
}

interface ProfileCardProps {
  profile: Profile;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const fullName = `${profile.firstName} ${profile.lastName}`;
  const avatar = profile.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0ea5e9&color=fff&size=128`;

  return (
    <div className={styles.profileCard}>
      <div className={styles.cardHeader}>
        <img src={avatar} alt={fullName} className={styles.avatar} />
        <div className={styles.headerInfo}>
          <h3 className={styles.name}>{fullName}</h3>
          {profile.userType && (
            <span className={styles.userType}>
              {profile.userType === 'freelancer' ? 'Freelancer' : 'Client'}
            </span>
          )}
        </div>
      </div>

      {profile.bio && (
        <p className={styles.bio}>{profile.bio}</p>
      )}

      <div className={styles.details}>
        {profile.email && (
          <div className={styles.detailItem}>
            <Icon icon="mdi:email" className={styles.icon} />
            <span>{profile.email}</span>
          </div>
        )}

        {profile.location && (
          <div className={styles.detailItem}>
            <Icon icon="mdi:map-marker" className={styles.icon} />
            <span>{profile.location}</span>
          </div>
        )}

        {profile.experience && (
          <div className={styles.detailItem}>
            <Icon icon="mdi:briefcase" className={styles.icon} />
            <span>{profile.experience}</span>
          </div>
        )}

        {profile.hourlyRate && (
          <div className={styles.detailItem}>
            <Icon icon="mdi:currency-usd" className={styles.icon} />
            <span>${profile.hourlyRate}/hr</span>
          </div>
        )}

        {profile.rating && (
          <div className={styles.detailItem}>
            <Icon icon="mdi:star" className={styles.icon} />
            <span>{profile.rating.toFixed(1)} / 5.0</span>
          </div>
        )}
      </div>

      {profile.skills && profile.skills.length > 0 && (
        <div className={styles.skills}>
          <h4 className={styles.skillsTitle}>Skills</h4>
          <div className={styles.skillsList}>
            {profile.skills.slice(0, 6).map((skill, index) => (
              <span key={index} className={styles.skillBadge}>
                {skill}
              </span>
            ))}
            {profile.skills.length > 6 && (
              <span className={styles.skillBadge}>+{profile.skills.length - 6} more</span>
            )}
          </div>
        </div>
      )}

      <button className={styles.viewProfileBtn}>
        <Icon icon="mdi:account" />
        View Full Profile
      </button>
    </div>
  );
};

export default ProfileCard;
