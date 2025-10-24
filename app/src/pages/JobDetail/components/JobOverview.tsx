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
  const [isSaved, setIsSaved] = React.useState(false);

  const handleSaveClick = () => {
    setIsSaved(!isSaved);
  };

  return (
    <div className={styles.jobOverview}>
      {/* Job Header */}
      <div className={styles.jobHeader}>
        
        <h1 style={{fontSize:"22px"}} className={styles.jobTitle}>{job.title}</h1>
        
        <div className={styles.jobMeta}>
            <span className={styles.postedTime}>Posted {job.postedTime}</span>
            <div style={{display: "flex", justifyItems:"left", gap:"10px"}}>
          <Icon style={{fontSize:"19px"}} icon="mdi:location-radius-outline"/> <span className={styles.location}>{job.location}</span>
             </div>
          <span className={styles.connects}>{job.connectsRequired}</span>

        </div>
      </div>
      <div className={styles.section } />
      {/* Summary Section */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Summary</h3>
        <p className={styles.summary}>{job.summary}</p>

<br />
 
        <div className={styles.budgetInfo}>
          <span className={styles.budgetAmount}>Budget:</span>
          <span className={styles.budgetType}>{job.budget} ({job.budgetType})</span>
        </div><br />
              {/* Requirements Section */}
      <div >
        <h3 className={styles.sectionTitle}>Requirements</h3>
        <ul className={styles.requirementsList}>
          {job.requirements.map((requirement, index) => (
            <li key={index} className={styles.requirementItem}>
              {requirement}
            </li>
          ))}
        </ul>
      </div><br />
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

      
      </div>


      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        <button className={styles.applyButton}>
          Apply now
        </button>
        <button 
          className={`${styles.saveButton} ${isSaved ? styles.saved : ''}`}
          onClick={handleSaveClick}
        >
          <Icon 
            icon={isSaved ? "material-symbols:favorite" : "material-symbols:favorite-outline"} 
            className={styles.saveIcon} 
          />
          {isSaved ? 'Saved' : 'Save job'}
        </button>
      </div>
    </div>
  );
};

export default JobOverview;
