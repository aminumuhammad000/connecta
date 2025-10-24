import React from 'react';
import { Icon } from '@iconify/react';
import styles from '../styles/JobDetailHeader.module.css';
import backIcon from '../../../assets/backicon.png';

interface JobDetailHeaderProps {
  jobTitle: string;
  onBack: () => void;
  onShare: () => void;
  onSave: () => void;
}

const JobDetailHeader: React.FC<JobDetailHeaderProps> = ({
  jobTitle,
  onBack,
  onSave
}) => {
  return (
    <div className={styles.header}>
      
      {/* Navigation Bar */}
      <div className={styles.navBar}>

        
        <div className={styles.actionIcons}>
          <img 
            src={backIcon}
            className={styles.shareIcon}
            onClick={onBack}
            alt="Go back"
          />
          
        </div>
      </div>
    </div>
  );
};

export default JobDetailHeader;
