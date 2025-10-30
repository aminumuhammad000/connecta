
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import JobDetailHeader from './components/JobDetailHeader';
import JobOverview from './components/JobOverview';
import JobDetails from './components/JobDetails';
import ClientInfo from './components/ClientInfo';
import styles from './styles/JobDetail.module.css';
import { getJobById } from '../../api/job';

const JobDetail: React.FC = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    setLoading(true);
    getJobById(jobId)
      .then(res => {
        setJob(res.data);
        setError(null);
      })
      .catch(() => {
        setError('Failed to load job details.');
      })
      .finally(() => setLoading(false));
  }, [jobId]);

  if (loading) return <div className={styles.jobDetail}>Loading...</div>;
  if (error) return <div className={styles.jobDetail}>{error}</div>;
  if (!job) return <div className={styles.jobDetail}>No job found.</div>;

  return (
    <div className={styles.jobDetail}>
      <JobDetailHeader 
        jobTitle={job.title}
        onBack={() => navigate('/dashboard')}
        onShare={() => console.log('Share job')}
        onSave={() => console.log('Save job')}
      />
      <div className={styles.content}>
        <JobOverview job={job} />
        <JobDetails job={job} />
        <ClientInfo client={job.clientId} />
      </div>
    </div>
  );
};

export default JobDetail;
