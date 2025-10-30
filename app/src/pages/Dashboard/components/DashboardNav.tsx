import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import styles from '../styles/DashboardNav.module.css';

const DashboardNav: React.FC = () => {
  const navigate = useNavigate();

  const navItems = [
    { label: 'My proposals', icon: 'weui:arrow-filled', path: '/proposals' },
    { label: 'My profile', icon: 'weui:arrow-filled', path: '/freelancer/profile' },
    { label: 'My project Dashboard', icon: 'weui:arrow-filled', path: '/project-dashboard' }
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className={styles.navContainer}>
      {navItems.map((item, index) => (
        <div 
          key={index} 
          className={styles.navItem}
          onClick={() => handleNavClick(item.path)}
        >
          <span className={styles.navLabel}>{item.label}</span>
          <Icon icon={item.icon} className={styles.navIcon} />
        </div>
      ))}
    </div>
  );
};

export default DashboardNav;
