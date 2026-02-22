import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/CreateJobSection.module.css';

const CreateJobSection = () => {
  const [jobTitle, setJobTitle] = useState('');
  const navigate = useNavigate();

  const handleGenerateWithAI = () => {
    if (jobTitle.trim()) {
      navigate('/connecta-ai', { state: { jobTitle } });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Create a New Job Post</h2>
          <p className={styles.subtitle}>Use our AI to generate a job description instantly.</p>
        </div>
        <Icon icon="material-symbols:auto-awesome" className={styles.icon} />
      </div>

      <div className={styles.inputWrapper}>
        <label htmlFor="job-title" className={styles.label}>
          Job Title
        </label>
        <input
          type="text"
          id="job-title"
          className={styles.input}
          placeholder="e.g., Senior UX/UI Designer for Mobile App"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
        />
      </div>

      <button 
        className={styles.button}
        onClick={handleGenerateWithAI}
        disabled={!jobTitle.trim()}
      >
        Generate with AI
      </button>
    </div>
  );
};

export default CreateJobSection;
