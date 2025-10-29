import { Icon } from '@iconify/react';
import styles from '../styles/DashboardStats.module.css';

interface DashboardStatsProps {
  stats: {
    activeJobs: number;
    totalCandidates: number;
    unreadMessages: number;
  };
}

const DashboardStats = ({ stats }: DashboardStatsProps) => {
  return (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <div className={styles.statIcon} style={{ backgroundColor: '#f97316' }}>
          <Icon icon="material-symbols:work-outline" />
        </div>
        <div className={styles.statContent}>
          <p className={styles.statLabel}>Active Jobs</p>
          <h3 className={styles.statValue}>{stats.activeJobs}</h3>
          <p className={styles.statChange}>
            {/* <Icon icon="material-symbols:trending-up" /> Active postings */}
          </p>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon} style={{ backgroundColor: '#f97316' }}>
          <Icon icon="material-symbols:group-outline" />
        </div>
        <div className={styles.statContent}>
          <p className={styles.statLabel}>Total Proposals</p>
          <h3 className={styles.statValue}>{stats.totalCandidates}</h3>
          <p className={styles.statChange}>
            {/* <Icon icon="material-symbols:trending-up" /> Applicants */}
          </p>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon} style={{ backgroundColor: '#f97316' }}>
          <Icon icon="material-symbols:mail-outline" />
        </div>
        <div className={styles.statContent}>
          <p className={styles.statLabel}>Messages</p>
          <h3 className={styles.statValue}>{stats.unreadMessages}</h3>
          <p className={styles.statChange}>
            {/* <Icon icon="material-symbols:schedule" /> Messages */}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
