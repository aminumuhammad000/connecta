import React from 'react';
import { Icon } from '@iconify/react';
import styles from '../styles/DashboardNav.module.css';

const DashboardNav: React.FC = () => {
  const navItems = [
    { label: 'My proposals', icon: 'weui:arrow-filled' },
    { label: 'My profile', icon: 'weui:arrow-filled' },
    { label: 'My project Dashboard', icon: 'weui:arrow-filled' }
  ];

  return (
    <div className={styles.navContainer}>
      {navItems.map((item, index) => (
        <div key={index} className={styles.navItem}>
          <span className={styles.navLabel}>{item.label}</span>
          <Icon icon={item.icon} className={styles.navIcon} />
        </div>
      ))}
    </div>
  );
};

export default DashboardNav;
