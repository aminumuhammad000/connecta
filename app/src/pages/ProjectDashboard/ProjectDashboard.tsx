import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Header from '../../components/Header';
import styles from './styles/ProjectDashboard.module.css';

interface Project {
  id: number;
  title: string;
  description: string;
  dateRange: string;
  status: 'ongoing' | 'completed';
  statusLabel: string;
}

const ProjectDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>('ongoing');

  const allProjects: Project[] = [
    {
      id: 1,
      title: 'UI/UX Designer for Fintech Screenshot',
      description: 'Lorem ipsum dolor sit amet consectetur. A et duis mattis vitae enim egestas risus nec. Arcu in velit hac tincidunt quam. Massa gravida velit etiam congue sodales aenean eget.',
      dateRange: '19th Oct,2025 - 14th Jan 2026',
      status: 'ongoing',
      statusLabel: 'Active'
    },
    {
      id: 2,
      title: 'UI/UX Designer for Fintech Screenshot',
      description: 'Lorem ipsum dolor sit amet consectetur. A et duis mattis vitae enim egestas risus nec. Arcu in velit hac tincidunt quam. Massa gravida velit etiam congue sodales aenean eget.',
      dateRange: '19th Oct,2025 - 14th Jan 2026',
      status: 'ongoing',
      statusLabel: 'Active'
    },
    {
      id: 3,
      title: 'UI/UX Designer for Fintech Screenshot',
      description: 'Lorem ipsum dolor sit amet consectetur. A et duis mattis vitae enim egestas risus nec. Arcu in velit hac tincidunt quam. Massa gravida velit etiam congue sodales aenean eget.',
      dateRange: '19th Oct,2025 - 14th Jan 2026',
      status: 'ongoing',
      statusLabel: 'Active'
    },
    {
      id: 4,
      title: 'UI/UX Designer for Fintech Screenshot',
      description: 'Lorem ipsum dolor sit amet consectetur. A et duis mattis vitae enim egestas risus nec. Arcu in velit hac tincidunt quam. Massa gravida velit etiam congue sodales aenean eget.',
      dateRange: '19th Oct,2025 - 14th Jan 2026',
      status: 'completed',
      statusLabel: 'Completed'
    },
    {
      id: 5,
      title: 'UI/UX Designer for Fintech Screenshot',
      description: 'Lorem ipsum dolor sit amet consectetur. A et duis mattis vitae enim egestas risus nec. Arcu in velit hac tincidunt quam. Massa gravida velit etiam congue sodales aenean eget.',
      dateRange: '19th Oct,2025 - 14th Jan 2026',
      status: 'completed',
      statusLabel: 'Completed'
    },
    {
      id: 6,
      title: 'UI/UX Designer for Fintech Screenshot',
      description: 'Lorem ipsum dolor sit amet consectetur. A et duis mattis vitae enim egestas risus nec. Arcu in velit hac tincidunt quam. Massa gravida velit etiam congue sodales aenean eget.',
      dateRange: '19th Oct,2025 - 14th Jan 2026',
      status: 'completed',
      statusLabel: 'Completed'
    }
  ];

  const filteredProjects = allProjects.filter(project => project.status === activeTab);

  const handleCardClick = (projectId: number) => {
    navigate(`/project/${projectId}`);
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    navigate('/messages');
  };

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
              key={project.id} 
              className={styles.projectCard}
              onClick={() => handleCardClick(project.id)}
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
                    onClick={handleChatClick}
                  >
                    <span>Chat</span>
                    <Icon icon="fluent:chat-28-regular" />
                  </button>
                )}
                
                <div className={styles.dateInfo}>
                  <Icon icon="material-symbols:calendar-today" className={styles.calendarIcon} />
                  <span className={styles.dateText}>{project.dateRange}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;
