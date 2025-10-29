import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import styles from '../styles/ClientHeader.module.css';

interface ClientHeaderProps {
  onMenuClick: () => void;
}

const ClientHeader = ({ onMenuClick }: ClientHeaderProps) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, []);

  const getUserName = () => {
    if (user) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
    }
    return 'User';
  };

  return (
    <header className={styles.header}>
      {/* Mobile Menu Button */}
      <button className={styles.menuButton} onClick={onMenuClick}>
        <Icon icon="material-symbols:menu" />
      </button>

      {/* Welcome Message */}
      <div className={styles.welcomeSection}>
        <h1 className={styles.title}>Welcome back, {getUserName()}</h1>
        <p className={styles.subtitle}>Here's your dashboard overview.</p>
      </div>

      {/* Right Section */}
      <div className={styles.rightSection}>
        {/* Notifications */}
        <button className={styles.notificationButton}>
          <Icon icon="material-symbols:notifications-outline" />
        </button>

        {/* User Profile */}
        <div className={styles.userProfile}>
          <img 
            src={user?.profileImage || 'https://i.pravatar.cc/150?img=10'} 
            alt="Profile" 
            className={styles.avatar}
          />
          <div className={styles.userInfo}>
            <p className={styles.userName}>{getUserName()}</p>
            <p className={styles.userRole}>Client</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ClientHeader;
