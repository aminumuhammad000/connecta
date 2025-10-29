import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import ClientSidebar from './components/ClientSidebar';
import ClientHeader from './components/ClientHeader';
import styles from './styles/ClientProjects.module.css';

interface Project {
  _id: string;
  title: string;
  description: string;
  status: 'ongoing' | 'completed' | 'cancelled';
  budget: {
    amount: number;
    currency: string;
    type: 'fixed' | 'hourly';
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
  freelancerId?: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  progress?: number;
  createdAt: string;
}

const ClientProjects = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<'all' | 'ongoing' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/projects/client/my-projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (data.success) {
        setProjects(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => 
    filter === 'all' ? true : project.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return '#3b82f6';
      case 'completed':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'mdi:clock-outline';
      case 'completed':
        return 'mdi:check-circle';
      case 'cancelled':
        return 'mdi:close-circle';
      default:
        return 'mdi:circle';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const projectStats = {
    total: projects.length,
    ongoing: projects.filter(p => p.status === 'ongoing').length,
    completed: projects.filter(p => p.status === 'completed').length,
    cancelled: projects.filter(p => p.status === 'cancelled').length,
  };

  return (
    <div className={styles.container}>
      <ClientSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={styles.mainContent}>
        <ClientHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <div className={styles.content}>
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>My Projects</h1>
              <p className={styles.pageSubtitle}>Manage and track all your projects</p>
            </div>
            <button 
              className={styles.createButton}
              onClick={() => navigate('/create-job')}
            >
              <Icon icon="mdi:plus" />
              Create New Project
            </button>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ backgroundColor: '#e0f2fe' }}>
                <Icon icon="mdi:folder-outline" style={{ color: '#0284c7' }} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Total Projects</p>
                <p className={styles.statValue}>{projectStats.total}</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ backgroundColor: '#dbeafe' }}>
                <Icon icon="mdi:clock-outline" style={{ color: '#3b82f6' }} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Ongoing</p>
                <p className={styles.statValue}>{projectStats.ongoing}</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ backgroundColor: '#d1fae5' }}>
                <Icon icon="mdi:check-circle" style={{ color: '#10b981' }} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Completed</p>
                <p className={styles.statValue}>{projectStats.completed}</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ backgroundColor: '#fee2e2' }}>
                <Icon icon="mdi:close-circle" style={{ color: '#ef4444' }} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Cancelled</p>
                <p className={styles.statValue}>{projectStats.cancelled}</p>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className={styles.filterSection}>
            <div className={styles.filterTabs}>
              <button
                className={`${styles.filterTab} ${filter === 'all' ? styles.filterTabActive : ''}`}
                onClick={() => setFilter('all')}
              >
                All Projects ({projectStats.total})
              </button>
              <button
                className={`${styles.filterTab} ${filter === 'ongoing' ? styles.filterTabActive : ''}`}
                onClick={() => setFilter('ongoing')}
              >
                Ongoing ({projectStats.ongoing})
              </button>
              <button
                className={`${styles.filterTab} ${filter === 'completed' ? styles.filterTabActive : ''}`}
                onClick={() => setFilter('completed')}
              >
                Completed ({projectStats.completed})
              </button>
              <button
                className={`${styles.filterTab} ${filter === 'cancelled' ? styles.filterTabActive : ''}`}
                onClick={() => setFilter('cancelled')}
              >
                Cancelled ({projectStats.cancelled})
              </button>
            </div>
          </div>

          {/* Projects List */}
          <div className={styles.projectsSection}>
            {loading ? (
              <div className={styles.loader}>
                <div className={styles.spinner}></div>
                <p>Loading projects...</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className={styles.emptyState}>
                <Icon icon="mdi:folder-open-outline" className={styles.emptyIcon} />
                <h3>No projects found</h3>
                <p>
                  {filter === 'all'
                    ? "You haven't created any projects yet. Start by creating your first project!"
                    : `No ${filter} projects at the moment.`}
                </p>
                {filter === 'all' && (
                  <button 
                    className={styles.emptyButton}
                    onClick={() => navigate('/create-job')}
                  >
                    <Icon icon="mdi:plus" />
                    Create First Project
                  </button>
                )}
              </div>
            ) : (
              <div className={styles.projectsGrid}>
                {filteredProjects.map((project) => (
                  <div
                    key={project._id}
                    className={styles.projectCard}
                    onClick={() => navigate(`/project/${project._id}`)}
                  >
                    {/* Card Header */}
                    <div className={styles.cardHeader}>
                      <div className={styles.statusBadge} style={{ backgroundColor: `${getStatusColor(project.status)}15`, color: getStatusColor(project.status) }}>
                        <Icon icon={getStatusIcon(project.status)} />
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </div>
                      <button 
                        className={styles.cardMenu}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle menu click
                        }}
                      >
                        <Icon icon="mdi:dots-vertical" />
                      </button>
                    </div>

                    {/* Card Content */}
                    <div className={styles.cardContent}>
                      <h3 className={styles.projectTitle}>{project.title}</h3>
                      <p className={styles.projectDescription}>
                        {project.description.length > 120
                          ? `${project.description.substring(0, 120)}...`
                          : project.description}
                      </p>
                    </div>

                    {/* Freelancer Info */}
                    {project.freelancerId && (
                      <div className={styles.freelancerInfo}>
                        <img
                          src={project.freelancerId.profileImage || `https://ui-avatars.com/api/?name=${project.freelancerId.firstName}+${project.freelancerId.lastName}&background=f97316&color=fff`}
                          alt={`${project.freelancerId.firstName} ${project.freelancerId.lastName}`}
                          className={styles.freelancerAvatar}
                        />
                        <div>
                          <p className={styles.freelancerLabel}>Freelancer</p>
                          <p className={styles.freelancerName}>
                            {project.freelancerId.firstName} {project.freelancerId.lastName}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Progress Bar (for ongoing projects) */}
                    {project.status === 'ongoing' && project.progress !== undefined && (
                      <div className={styles.progressSection}>
                        <div className={styles.progressHeader}>
                          <span className={styles.progressLabel}>Progress</span>
                          <span className={styles.progressValue}>{project.progress}%</span>
                        </div>
                        <div className={styles.progressBar}>
                          <div 
                            className={styles.progressFill} 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Card Footer */}
                    <div className={styles.cardFooter}>
                      <div className={styles.footerItem}>
                        <Icon icon="mdi:currency-usd" />
                        <span>
                          ${project.budget.amount.toLocaleString()}
                          {project.budget.type === 'hourly' ? '/hr' : ''}
                        </span>
                      </div>
                      <div className={styles.footerItem}>
                        <Icon icon="mdi:calendar-outline" />
                        <span>
                          {formatDate(project.dateRange.startDate)} - {formatDate(project.dateRange.endDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProjects;
