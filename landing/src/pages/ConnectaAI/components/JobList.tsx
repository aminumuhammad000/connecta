import React from 'react';
import JobCard from './JobCard';
import type { Job } from './JobCard';
import styles from './JobList.module.css';

interface JobListProps {
  jobs: Job[];
}

const JobList: React.FC<JobListProps> = ({ jobs }) => {
  console.log('Rendering JobList with jobs:', jobs);
  
  if (!jobs || !Array.isArray(jobs)) {
    console.error('Invalid jobs data:', jobs);
    return <div className={styles.noJobs}>No valid job data available</div>;
  }

  if (jobs.length === 0) {
    return <div className={styles.noJobs}>No jobs found matching your criteria</div>;
  }

  return (
    <div className={styles.jobList}>
      {jobs.map((job, index) => {
        if (!job || typeof job !== 'object') {
          console.error('Invalid job at index', index, ':', job);
          return null;
        }
        return <JobCard key={job._id || `job-${index}`} job={job} />;
      })}
    </div>
  );
};

export default JobList;
