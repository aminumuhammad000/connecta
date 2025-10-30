
import React from 'react';
import styles from './Profile.module.css';
import ClientSidebar from '../components/ClientSidebar';
import ClientHeader from '../components/ClientHeader';
import { Icon } from '@iconify/react';
import { useAuth } from '../../../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();

  // Provide a default onClose function for sidebar
  const handleSidebarClose = () => {};

  if (!user) {
    return (
      <div className={styles.profilePageBg}>
        <ClientSidebar isOpen={true} onClose={handleSidebarClose} />
        <div className={styles.profileMain}>
          <ClientHeader />
          <div className={styles.profileCard}>
            <p style={{ color: '#3b82f6', fontWeight: 500 }}>No profile data found.</p>
          </div>
        </div>
      </div>
    );
  }

  const fullName = `${user.firstName} ${user.lastName}`;
  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=3b82f6&color=fff&size=128`;

  return (
    <div className={styles.container}>
      <ClientSidebar isOpen={true} onClose={handleSidebarClose} />
        <ClientHeader />
        <div className={styles.profileCard}>
          <div className={styles.avatarSection}>
            <img src={avatar} alt="Profile" className={styles.avatar} />
            <div>
              <h2 className={styles.name}>{fullName}</h2>
              <p className={styles.role}><Icon icon="mdi:briefcase-outline" /> {user.userType === 'client' ? 'Client' : 'Freelancer'}</p>
              <p className={styles.email}><Icon icon="mdi:email-outline" /> {user.email}</p>
            </div>
          </div>
          <div className={styles.bioSection}>
            <h3>About</h3>
            <p style={{color:'tomato'}}>Welcome to your Connecta profile!<br/>You can edit your details and manage your account here soon.</p>
          </div>
          <button className={styles.editBtn}><Icon icon="mdi:pencil-outline" /> Edit Profile</button>
        </div>
    </div>
  );
};

export default Profile;
