import { Icon } from '@iconify/react';
import { useState, useEffect, useRef } from 'react';
import styles from '../styles/ClientHeader.module.css';

interface ClientHeaderProps {
  onMenuClick: () => void;
}

const ClientHeader = ({ onMenuClick }: ClientHeaderProps) => {
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

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
        <div style={{background:"tomato", padding:"5px", width:"25px", color:"white", cursor:"pointer", borderRadius:"50%"}}>
        <Icon icon="material-symbols:auto-awesome-outline" className={styles.navIcon} />
         
        </div>

        {/* User Profile Dropdown */}
        <div className={styles.userProfile} ref={dropdownRef}>
          <img 
            src={user?.profileImage || 'https://i.pravatar.cc/150?img=10'} 
            alt="Profile" 
            className={styles.avatar}
            style={{ cursor: 'pointer' }}
            onClick={() => setDropdownOpen((open) => !open)}
          />
          <Icon icon="material-symbols:arrow-drop-down" style={{ fontSize: 24, marginLeft: 2, cursor: 'pointer', verticalAlign: 'middle' }} onClick={() => setDropdownOpen((open) => !open)} />
          {dropdownOpen && (
            <div className={styles.profileDropdown}>
              <button className={styles.dropdownItem} onClick={() => { setDropdownOpen(false); window.location.href = '/client/profile'; }}>
                <Icon icon="mdi:account-circle-outline" style={{ marginRight: 8 }} /> My Profile
              </button>
              <button className={styles.dropdownItem} onClick={() => { setDropdownOpen(false); localStorage.clear(); window.location.href = '/login'; }}>
                <Icon icon="material-symbols:logout" style={{ marginRight: 8 }} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default ClientHeader;
