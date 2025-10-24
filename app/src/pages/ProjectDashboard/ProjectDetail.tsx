import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import styles from './styles/ProjectDetail.module.css';

const ProjectDetail: React.FC = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/project-dashboard');
  };

  return (
    <div className={styles.projectDetailPage}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.closeButton} onClick={handleClose}>
          <Icon icon="maki:cross" />
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <h1 className={styles.projectTitle}>UI/UX Designer for Fintech Screenshot Design</h1>
        
        <div className={styles.statusSection}>
          <span className={styles.statusBadge}>Active</span>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Client:</span>
            <span className={styles.infoValue}>
              Mustapha Hussein
              <Icon icon="material-symbols:verified" className={styles.verifiedIcon} />
            </span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Project Type:</span>
            <span className={styles.infoValue}>One-time project</span>
          </div>
        </div>

        {/* Summary */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Summary</h2>
          <p className={styles.summaryText}>
            We need a UI/UX designer to create one professional screenshot design for our fintech mobile app. This will be used for app store presentation and marketing.
          </p>
          <p className={styles.summaryText}>
            You'll design a single high-quality mobile app screenshot with a modern, professional fintech aesthetic. The design should be clean, visually appealing, and presentation-ready. One screenshot design with source files in Figma.
          </p>
          <div className={styles.budgetInfo}>
            <p><strong>Budget:</strong> $25 USD (Fixed price)</p>
            <p><strong>Deadline:</strong> 14th Jan 2026</p>
          </div>
        </div>

        {/* Deliverables */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Deliverables</h2>
          <ul className={styles.deliverablesList}>
            <li>Figma design for responsive landing page</li>
            <li>Hero banner with call-to-action</li>
            <li>Product highlight section</li>
            <li>About or brand story section</li>
            <li>Contact or newsletter sign-up</li>
          </ul>
        </div>

        {/* Project Activity */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Project Activity</h2>
          <ul className={styles.activityList}>
            <li>12th Oct 2025 — Client approved milestone</li>
            <li>8th Oct 2025 — Uploaded first draft</li>
            <li>6th Oct 2025 — Project assigned</li>
          </ul>
        </div>

        {/* Upload Section */}
        <div className={styles.uploadSection}>
          <div className={styles.uploadIcons}>
            <button className={styles.uploadIconButton}>
              <Icon icon="bxs:image" />
            </button>
            <button className={styles.uploadIconButton}>
              <Icon icon="bxs:video" />
            </button>
            <button className={styles.uploadIconButton}>
              <Icon icon="tabler:txt" />
            </button>
            <button className={styles.uploadIconButton}>
              <Icon icon="mdi:link-variant" />
            </button>
            <button className={styles.uploadIconButton}>
              <Icon icon="bxs:file" />
            </button>
            <button className={styles.uploadIconButton}>
              <Icon icon="bxs:music" />
            </button>
          </div>
          <p className={styles.uploadText}>Upload file / project here</p>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button className={styles.chatButton}>
            <span>Chat client</span>
            <Icon icon="fluent:chat-28-regular" />
          </button>
          <button className={styles.completeButton}>
            Mark as completed
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
