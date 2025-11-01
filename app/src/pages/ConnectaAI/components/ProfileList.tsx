import ProfileCard from './ProfileCard';
import type { Profile } from './ProfileCard';
import styles from './ProfileList.module.css';

interface ProfileListProps {
  profiles: Profile[];
}

const ProfileList: React.FC<ProfileListProps> = ({ profiles }) => {
  return (
    <div className={styles.profileList}>
      {profiles.map((profile) => (
        <ProfileCard key={profile._id} profile={profile} />
      ))}
    </div>
  );
};

export default ProfileList;
