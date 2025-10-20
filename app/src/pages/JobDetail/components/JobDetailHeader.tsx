import React from 'react';
import { Icon } from '@iconify/react';
import styles from '../styles/JobDetailHeader.module.css';

interface JobDetailHeaderProps {
  jobTitle: string;
  onBack: () => void;
  onShare: () => void;
  onSave: () => void;
}

const JobDetailHeader: React.FC<JobDetailHeaderProps> = ({
  jobTitle,
  onBack,
  onShare,
  onSave
}) => {
  return (
    <div className={styles.header}>
      {/* Status Bar */}
      <div className={styles.statusBar}>
        <span className={styles.time}>9:41</span>
        <div className={styles.statusIcons}>
          <Icon icon="material-symbols:signal-cellular-4-bar" className={styles.signalIcon} />
          <Icon icon="material-symbols:wifi" className={styles.wifiIcon} />
          <Icon icon="material-symbols:battery-full" className={styles.batteryIcon} />
        </div>
      </div>

      {/* Navigation Bar */}
      <div className={styles.navBar}>
        <Icon 
          icon="material-symbols:arrow-back" 
          className={styles.backIcon}
          onClick={onBack}
        />
        
        <h1 className={styles.jobTitle}>{jobTitle}</h1>
        
        <div className={styles.actionIcons}>
          <Icon 
            icon="material-symbols:share" 
            className={styles.shareIcon}
            onClick={onShare}
          />
          <Icon 
            icon="material-symbols:bookmark-outline" 
            className={styles.saveIcon}
            onClick={onSave}
          />
        </div>
      </div>
    </div>
  );
};

export default JobDetailHeader;
