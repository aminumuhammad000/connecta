import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import styles from './AddPortfolio.module.css';

export const AddPortfolio = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    projectTitle: '',
    yourRole: '',
    projectDescription: '',
    skillsAndDeliverables: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClose = () => {
    navigate('/edit-profile');
  };

  const handleSaveAsDraft = () => {
    console.log('Saving as draft:', formData);
    navigate('/edit-profile');
  };

  const handlePreview = () => {
    console.log('Preview portfolio:', formData);
  };

  return (
    <div className={styles.addPortfolioPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.spacer}></div>
        <button className={styles.closeButton} onClick={handleClose}>
          <Icon icon="lucide:x" className={styles.closeIcon} />
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Title */}
        <div className={styles.titleSection}>
          <h1 className={styles.pageTitle}>Add a new portfolio project</h1>
          <p className={styles.subtitle}>
            Please complete all required fields unless marked as optional.
          </p>
        </div>

        {/* Form */}
        <div className={styles.form}>
          {/* Project Title */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Project title</label>
            <input
              type="text"
              name="projectTitle"
              value={formData.projectTitle}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Add a clear, concise title that describes your project"
            />
          </div>

          {/* Your Role */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              Your role <span className={styles.optional}>(optional)</span>
            </label>
            <input
              type="text"
              name="yourRole"
              value={formData.yourRole}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="e.g UI/UX designer or Front-end engineer"
            />
          </div>

          {/* Project Description */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Project description</label>
            <textarea
              name="projectDescription"
              value={formData.projectDescription}
              onChange={handleInputChange}
              className={styles.textarea}
              rows={4}
              placeholder="Summarize the project's objectives, explain your approach, and highlight the results or impact."
            />
          </div>

          {/* Skills and Deliverables */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Skills and deliverables</label>
            <input
              type="text"
              name="skillsAndDeliverables"
              value={formData.skillsAndDeliverables}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Type to add the skills that best match this project"
            />
          </div>

          {/* Media Upload Section */}
          <div className={styles.mediaSection}>
            <div className={styles.mediaGrid}>
              <button className={styles.mediaButton}>
                <Icon icon="lucide:image" className={styles.mediaIcon} />
              </button>
              <button className={styles.mediaButton}>
                <Icon icon="lucide:video" className={styles.mediaIcon} />
              </button>
              <button className={styles.mediaButton}>
                <Icon icon="lucide:type" className={styles.mediaIcon} />
              </button>
              <button className={styles.mediaButton}>
                <Icon icon="lucide:link" className={styles.mediaIcon} />
              </button>
              <button className={styles.mediaButton}>
                <Icon icon="lucide:file-text" className={styles.mediaIcon} />
              </button>
              <button className={styles.mediaButton}>
                <Icon icon="lucide:music" className={styles.mediaIcon} />
              </button>
            </div>
            <p className={styles.mediaText}>Add content</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button className={styles.draftButton} onClick={handleSaveAsDraft}>
            Save as draft
          </button>
          <button className={styles.previewButton} onClick={handlePreview}>
            Preview
          </button>
        </div>
      </div>
    </div>
  );
};