import React from 'react';
import { Icon } from '@iconify/react';
import styles from '../styles/JobOverview.module.css';

interface JobOverviewProps {
  job: {
    title: string;
    postedTime: string;
    location: string;
    connectsRequired: string;
    summary: string;
    budget: string;
    budgetType: string;
    requirements: string[];
    deliverables: string[];
  };
}

const JobOverview: React.FC<JobOverviewProps> = ({ job }) => {
  return (
    <div className={styles.jobOverview}>
      {/* Job Header */}
      <div className={styles.jobHeader}>
        <div className={styles.topRow}>
          <span className={styles.postedTime}>Posted {job.postedTime}</span>
          <span className={styles.aiMatched}>AI matched</span>
        </div>
        
        <h1 className={styles.jobTitle}>{job.title}</h1>
        
        <div className={styles.jobMeta}>
          <span className={styles.location}>{job.location}</span>
          <span className={styles.connects}>{job.connectsRequired}</span>
        </div>
      </div>

      {/* Summary Section */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Summary</h3>
        <p className={styles.summary}>{job.summary}</p>
      </div>

      {/* Budget Section */}
      <div className={styles.section}>
        <div className={styles.budgetInfo}>
          <span className={styles.budgetAmount}>{job.budget}</span>
          <span className={styles.budgetType}>({job.budgetType})</span>
        </div>
      </div>

      {/* Requirements Section */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Requirements</h3>
        <ul className={styles.requirementsList}>
          {job.requirements.map((requirement, index) => (
            <li key={index} className={styles.requirementItem}>
              {requirement}
            </li>
          ))}
        </ul>
      </div>

      {/* Deliverables Section */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Deliverables</h3>
        <ul className={styles.deliverablesList}>
          {job.deliverables.map((deliverable, index) => (
            <li key={index} className={styles.deliverableItem}>
              {deliverable}
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        <button className={styles.applyButton}>
          Apply now
        </button>
        <button className={styles.saveButton}>
          <Icon icon="material-symbols:favorite-outline" className={styles.saveIcon} />
          Save job
        </button>
      </div>
    </div>
  );
};

export default JobOverview;
