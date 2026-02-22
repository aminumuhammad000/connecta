import React from 'react';
import styles from './JobCard.module.css';

export interface Salary {
  min: number;
  max: number;
  currency: string;
}

export interface Job {
  _id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  locationType: string;
  jobType: string;
  description: string;
  salary: Salary;
  skills: string[];
  posted: string;
  experience: string;
}

export interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const formatSalary = (salary: Salary) => {
    if (salary.min === 0 && salary.max === 0) return 'Salary not specified';
    return `${salary.min.toLocaleString()} - ${salary.max.toLocaleString()} ${salary.currency}/year`;
  };

  return (
    <div className={styles.jobCard}>
      <div className={styles.jobHeader}>
        <div className={styles.companyInfo}>
          {job.companyLogo ? (
            <img src={job.companyLogo} alt={job.company} className={styles.companyLogo} />
          ) : (
            <div className={styles.companyInitial}>{job.company.charAt(0)}</div>
          )}
          <div>
            <h3 className={styles.jobTitle}>{job.title}</h3>
            <p className={styles.companyName}>{job.company}</p>
          </div>
        </div>
        <div className={styles.jobMeta}>
          <span className={`${styles.jobType} ${styles[job.jobType.replace('-', '')]}`}>
            {job.jobType}
          </span>
          <span className={styles.locationType}>
            {job.locationType.charAt(0).toUpperCase() + job.locationType.slice(1)}
          </span>
        </div>
      </div>

      <div className={styles.jobDetails}>
        <div className={styles.detailItem}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{job.location}</span>
        </div>
        <div className={styles.detailItem}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="2" y="4" width="20" height="18" rx="2" ry="2" />
            <path d="M8 2v4M16 2v4M2 10h20M9 16l2 2 4-4" />
          </svg>
          <span>Posted {formatDate(job.posted)}</span>
        </div>
        {job.salary && (job.salary.min > 0 || job.salary.max > 0) && (
          <div className={styles.detailItem}>
            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span>{formatSalary(job.salary)}</span>
          </div>
        )}
        <div className={styles.detailItem}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span>{job.experience} experience</span>
        </div>
      </div>

      <div className={styles.jobDescription}>
        <p>{job.description.length > 150 ? `${job.description.substring(0, 150)}...` : job.description}</p>
      </div>

      <div className={styles.skillsContainer}>
        {job.skills.slice(0, 5).map((skill, index) => (
          <span key={index} className={styles.skillTag}>
            {skill}
          </span>
        ))}
        {job.skills.length > 5 && (
          <span className={styles.moreSkills}>+{job.skills.length - 5} more</span>
        )}
      </div>

      <div className={styles.jobActions}>
        <button className={styles.applyButton}>View Details</button>
        <button className={styles.saveButton}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default JobCard;
