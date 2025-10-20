import React from 'react';
import { Icon } from '@iconify/react';
import Logo from '../../../assets/logo.png';
import SearchBar from './SearchBar';
import styles from '../styles/DashboardHeader.module.css';

const DashboardHeader: React.FC = () => {
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

      {/* Search Bar */}
      <SearchBar 
        placeholder="Search jobs..."
        onSearch={(value) => console.log('Search:', value)}
        onClear={() => console.log('Clear search')}
        onFilter={(filters) => console.log('Filters:', filters)}
      />
    </div>
  );
};

export default DashboardHeader;
