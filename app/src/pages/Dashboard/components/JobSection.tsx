import React, { useState } from 'react';
import styles from '../styles/JobSection.module.css';

const JobSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Best Matches');
  
  const tabs = ['Best Matches', 'Most Recent', 'Saved Jobs'];

  return (
    <div className={styles.jobSection}>
      <h2 className={styles.sectionTitle}>Jobs you might like</h2>
      
      <div className={styles.tabsContainer}>
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <p className={styles.description}>
        Handpicked gigs just for you matched by AI based on your skills and experience
      </p>
    </div>
  );
};

export default JobSection;

