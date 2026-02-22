import React from 'react';
import styles from '../styles/JobSection.module.css';

interface JobSectionProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const JobSection: React.FC<JobSectionProps> = ({ activeFilter, onFilterChange }) => {
  const tabs = ['Best Matches', 'Most Recent', 'Saved Jobs'];

  return (
    <div className={styles.jobSection}>
      <h2 className={styles.sectionTitle}>Jobs you might like</h2>
      
      <div className={styles.tabsContainer}>
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeFilter === tab ? styles.activeTab : ''}`}
            onClick={() => onFilterChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <p className={styles.description}>
        {activeFilter === 'Best Matches' && 'Handpicked gigs just for you matched by AI based on your skills and experience'}
        {activeFilter === 'Most Recent' && 'Latest job postings sorted by date'}
        {activeFilter === 'Saved Jobs' && 'Jobs you have saved for later'}
      </p>
    </div>
  );
};

export default JobSection;

