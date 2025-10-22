import React from 'react';
import { Icon } from '@iconify/react';
import Logo from '../assets/logo.png';
import styles from '../styles/components/Header.module.css';

const Header: React.FC = () => {
  return (
    <div className={styles.header}>
      {/* Navigation Bar */}
      <div className={styles.navBar}>
        <Icon icon="pajamas:hamburger" className={styles.hamburgerIcon} />
        
        <div className={styles.logo}>
          <img className={styles.logoicon} src={Logo} alt="" />
        </div>

        <Icon  icon="ri:search-ai-line" className={styles.hamburgerIcon}/>
      </div>
    </div>
  );
};

export default Header;
