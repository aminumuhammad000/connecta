import React from 'react';
import styles from '../styles/ProfileDetails.module.css';

interface SectionHeaderProps {
  title: string;
  variant?: 'default' | 'muted';
  ActionIcon?: () => React.ReactElement;
  onActionClick?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, variant = 'default', ActionIcon, onActionClick }) => {
  const titleClass = variant === 'muted'
    ? styles.sectionTitleMuted
    : styles.sectionTitle;

  return (
    <div className={styles.sectionHeader}>
      <h3 className={titleClass}>{title}</h3>
      {ActionIcon && (
        <button aria-label={`Edit ${title}`} className={styles.actionButton} onClick={onActionClick}>
          <div className={styles.iconWrapper}>
            <ActionIcon />
          </div>
        </button>
      )}
    </div>
  );
};
