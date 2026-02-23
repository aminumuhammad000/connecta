import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import DashboardNav from './components/DashboardNav';
import JobSection from './components/JobSection';
import JobCard from './components/JobCard';
import styles from './styles/Dashboard.module.css';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  locationType: string;
  jobType: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  skills: string[];
  experience: string;
  posted: string;
  applicants: number;
  status: string;
  category: string;
}

const Dashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Best Matches');
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const { showError } = useNotification();

  useEffect(() => {
    fetchJobs();
    // Load saved jobs from localStorage
    const saved = localStorage.getItem('savedJobs');
    if (saved) {
      setSavedJobIds(JSON.parse(saved));
    }
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/jobs/recommended?limit=20`);
      const data = await response.json();

      if (data.success) {
        setJobs(data.data);
      } else {
        showError('Failed to load jobs');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      showError('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleSaveJob = (jobId: string) => {
    const newSavedJobs = savedJobIds.includes(jobId)
      ? savedJobIds.filter(id => id !== jobId)
      : [...savedJobIds, jobId];
    
    setSavedJobIds(newSavedJobs);
    localStorage.setItem('savedJobs', JSON.stringify(newSavedJobs));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleFilterChange = (filters: string[]) => {
    setSelectedFilters(filters);
  };

  // Filter jobs based on active filter, search, and additional filters
  const getFilteredJobs = () => {
    let filteredList = jobs;

    // Apply tab filter (Best Matches, Most Recent, Saved Jobs)
    switch (activeFilter) {
      case 'Most Recent':
        filteredList = [...filteredList].sort((a, b) => 
          new Date(b.posted).getTime() - new Date(a.posted).getTime()
        );
        break;
      case 'Saved Jobs':
        filteredList = filteredList.filter(job => savedJobIds.includes(job._id));
        break;
      case 'Best Matches':
      default:
        // Default order from API (best matches)
        break;
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredList = filteredList.filter(job => 
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.skills.some(skill => skill.toLowerCase().includes(query)) ||
        job.location.toLowerCase().includes(query) ||
        job.category.toLowerCase().includes(query)
      );
    }

    // Apply additional filters (Design, Mobile, Remote, Budget, AI)
    if (selectedFilters.length > 0) {
      filteredList = filteredList.filter(job => {
        return selectedFilters.every(filter => {
          switch (filter) {
            case 'Design':
              return job.category.toLowerCase().includes('design') || 
                     job.skills.some(s => s.toLowerCase().includes('design'));
            case 'Mobile':
              return job.category.toLowerCase().includes('mobile') || 
                     job.skills.some(s => s.toLowerCase().includes('mobile') || 
                                          s.toLowerCase().includes('flutter') || 
                                          s.toLowerCase().includes('react native'));
            case 'Remote':
              return job.locationType.toLowerCase() === 'remote';
            case 'Budget':
              return job.salary && job.salary.min >= 50000;
            case 'AI':
              // AI matched - just return true since all are AI matched
              return true;
            default:
              return true;
          }
        });
      });
    }

    return filteredList;
  };

  const filteredJobs = getFilteredJobs();

  // Transform backend job data to match JobCard component props
  const transformJob = (job: Job) => {
    const postedDate = new Date(job.posted);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - postedDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    let postedTime = '';
    if (diffDays > 0) {
      postedTime = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      postedTime = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      postedTime = `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }

    const budget = job.salary
      ? `${job.salary.currency} ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}`
      : 'Not specified';

    return {
      id: job._id,
      postedTime,
      title: job.title,
      budget,
      description: job.description,
      skills: job.skills,
      isPaymentVerified: true,
      amountSpent: budget,
      rating: 5,
      location: job.location,
      proposals: `${job.applicants} to ${job.applicants + 5}`,
      freelancersNeeded: 1,
    };
  };

  return (
    <div className={styles.dashboard}>
      <Header />
      <SearchBar 
        onSearch={handleSearch}
        onClear={handleClearSearch}
        onFilter={handleFilterChange}
      />
      <DashboardNav />
      <JobSection 
        activeFilter={activeFilter}
        onFilterChange={handleTabChange}
      />
      
      {loading ? (
        <div className={styles.loadingContainer}>
          <p>Loading jobs...</p>
        </div>
      ) : (
        <>
          {(searchQuery || selectedFilters.length > 0) && (
            <div className={styles.resultsCount}>
              <p>
                {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>
          )}
          <div className={styles.jobsList}>
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <JobCard 
                  key={job._id} 
                  job={transformJob(job)}
                  isSaved={savedJobIds.includes(job._id)}
                  onSaveToggle={() => handleSaveJob(job._id)}
                />
              ))
            ) : (
              <div className={styles.noJobs}>
                <p>
                  {activeFilter === 'Saved Jobs' 
                    ? 'No saved jobs yet. Save jobs to view them here later.' 
                    : 'No jobs available at the moment.'}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;

