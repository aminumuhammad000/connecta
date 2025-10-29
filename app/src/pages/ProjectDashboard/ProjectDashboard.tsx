import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Header from '../../components/Header';
import { useNotification } from '../../contexts/NotificationContext';
import styles from './styles/ProjectDashboard.module.css';

interface Project {
  _id: string;
  title: string;
  description: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  status: 'ongoing' | 'completed' | 'cancelled';
  statusLabel: string;
  clientId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  clientName: string;
}

const ProjectDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>('ongoing');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { showLoader, hideLoader, showError } = useNotification();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      showLoader();
      
      // Get all projects (for demo purposes)
      // TODO: Replace with user-specific endpoint when auth is implemented
      const response = await fetch(`http://localhost:5000/api/projects?limit=50`);
      const data = await response.json();

      if (data.success) {
        setProjects(data.data);
        console.log('Loaded projects:', data.data.length);
      } else {
        showError(data.message || 'Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      showError('Failed to load projects. Please try again.');
    } finally {
      hideLoader();
      setLoading(false);
    }
  };

  const formatDateRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startFormatted = start.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
    
    const endFormatted = end.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
    
    return `${startFormatted} - ${endFormatted}`;
  };

  const filteredProjects = projects.filter(project => project.status === activeTab);

  const handleCardClick = (projectId: string, status: string) => {
    // Only allow navigation for ongoing projects
    if (status === 'ongoing') {
      navigate(`/project/${projectId}`);
    }
  };

  const handleChatClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation(); // Prevent card click navigation
    // Navigate to messages with client info and project context
    navigate('/messages', { 
      state: { 
        clientId: project.clientId._id, 
        clientName: project.clientName,
        projectId: project._id,
        projectTitle: project.title
      } 
    });
  };

  if (loading) {
    return (
      <div className={styles.projectDashboardPage}>
        <Header />
        <div className={styles.loadingContainer}>
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.projectDashboardPage}>
      <Header />
      
      <div className={styles.content}>
        <h1 className={styles.pageTitle}>My project dashboard</h1>
        
        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'ongoing' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('ongoing')}
          >
            Ongoing projects
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'completed' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
        </div>

        {/* Projects List */}
        <div className={styles.projectsList}>
          {filteredProjects.map((project) => (
            <div 
              key={project._id} 
              className={`${styles.projectCard} ${project.status === 'completed' ? styles.completedCard : ''}`}
              onClick={() => handleCardClick(project._id, project.status)}
            >
              <div className={styles.cardHeader}>
                <h2 className={styles.projectTitle} style={{fontSize:"20px"}}>{project.title}</h2>
                <span className={`${styles.statusBadge} ${project.status === 'ongoing' ? styles.active : styles.completed}`}>
                  {project.statusLabel}
                </span>
              </div>

              <p className={styles.description}>{project.description}</p>

              <div className={`${styles.cardFooter} ${project.status === 'completed' ? styles.completedFooter : ''}`}>
                {project.status === 'ongoing' && (
                  <button 
                    className={styles.chatButton}
                    onClick={(e) => handleChatClick(e, project)}
                  >
                    <span>Chat</span>
                    <Icon icon="fluent:chat-28-regular" />
                  </button>
                )}
                
                <div className={styles.dateInfo}>
                  <Icon icon="material-symbols:calendar-today" className={styles.calendarIcon} />
                  <span className={styles.dateText}>{formatDateRange(project.dateRange.startDate, project.dateRange.endDate)}</span>
                </div>
              </div>
            </div>
          ))}
          
          {filteredProjects.length === 0 && !loading && (
            <div className={styles.emptyState}>
              <p>No {activeTab === 'ongoing' ? 'ongoing' : 'completed'} projects available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;
