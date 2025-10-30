import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import styles from '../styles/JobOverview.module.css';

import { applyToJob } from '../../../api/proposal';
import { useNotification } from '../../../contexts/NotificationContext';

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
    id?: string;
  };
}


const JobOverview: React.FC<JobOverviewProps> = ({ job }) => {
  // Defensive: fallback to empty array if undefined
  const requirements = job.requirements || [];
  const deliverables = job.deliverables || [];
  const [isSaved, setIsSaved] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [budget, setBudget] = useState('');
  const [duration, setDuration] = useState({ startDate: '', endDate: '' });
  const [level, setLevel] = useState('entry');
  const [priceType, setPriceType] = useState('fixed');
  const { showLoader, hideLoader, showSuccess, showError } = useNotification();

  const handleSaveClick = () => {
    setIsSaved(!isSaved);
  };

  const handleApply = async () => {
    if (!coverLetter || !budget || !duration.startDate || !duration.endDate) {
      showError('Please fill all fields');
      return;
    }
    showLoader();
    try {
      await applyToJob({
        jobId: job.id || '',
        coverLetter,
        budget: Number(budget),
        duration,
        level,
        priceType,
        title: job.title,
      });
      showSuccess('Applied successfully!');
      setShowModal(false);
      setCoverLetter('');
      setBudget('');
      setDuration({ startDate: '', endDate: '' });
    } catch (err: any) {
      showError(err?.response?.data?.message || err.message || 'Failed to apply');
    } finally {
      hideLoader();
    }
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
          {requirements.map((requirement, index) => (
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
          {deliverables.map((deliverable, index) => (
            <li key={index} className={styles.deliverableItem}>
              {deliverable}
            </li>
          ))}
        </ul>
      </div>

      
      </div>


      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        <button className={styles.applyButton} onClick={() => setShowModal(true)}>
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

      {/* Simple Modal for Apply */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Apply to this job</h2>
            <label>Cover Letter</label>
            <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
            <label>Budget (₦)</label>
            <input type="number" value={budget} onChange={e => setBudget(e.target.value)} />
            <label>Start Date</label>
            <input type="date" value={duration.startDate} onChange={e => setDuration(d => ({ ...d, startDate: e.target.value }))} />
            <label>End Date</label>
            <input type="date" value={duration.endDate} onChange={e => setDuration(d => ({ ...d, endDate: e.target.value }))} />
            <label>Level</label>
            <select value={level} onChange={e => setLevel(e.target.value)}>
              <option value="entry">Entry</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">Expert</option>
            </select>
            <label>Price Type</label>
            <select value={priceType} onChange={e => setPriceType(e.target.value)}>
              <option value="fixed">Fixed</option>
              <option value="hourly">Hourly</option>
            </select>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button onClick={handleApply} className={styles.applyButton}>Submit</button>
              <button onClick={() => setShowModal(false)} className={styles.saveButton}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobOverview;
