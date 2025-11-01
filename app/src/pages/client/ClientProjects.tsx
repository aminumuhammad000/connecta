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

interface Proposal {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    budget: string;
    description: string;
  };
  freelancerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
    skills?: string[];
    bio?: string;
    hourlyRate?: number;
  };
  coverLetter: string;
  proposedRate: number;
  estimatedDuration: string;
  status: 'pending' | 'accepted' | 'rejected' | 'approved';
  createdAt: string;
}

const ClientProjects = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [filter, setFilter] = useState<'all' | 'ongoing' | 'completed' | 'cancelled'>('all');
  const [activeTab, setActiveTab] = useState<'projects' | 'proposals'>('projects');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
    fetchProposals();
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

  const fetchProposals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/proposals/client/accepted', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (data.success) {
        setProposals(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
    }
  };

  const handleApproveProposal = async (proposalId: string) => {
    setActionLoading(proposalId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/proposals/${proposalId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      
      if (data.success) {
        alert('Proposal approved! You can now start chatting with the freelancer.');
        fetchProposals();
        setSelectedProposal(null);
      } else {
        alert(data.message || 'Failed to approve proposal');
      }
    } catch (error) {
      console.error('Error approving proposal:', error);
      alert('Failed to approve proposal');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineProposal = async (proposalId: string) => {
    if (!confirm('Are you sure you want to decline this proposal?')) {
      return;
    }
    
    setActionLoading(proposalId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/proposals/${proposalId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      
      if (data.success) {
        alert('Proposal declined');
        fetchProposals();
        setSelectedProposal(null);
      } else {
        alert(data.message || 'Failed to decline proposal');
      }
    } catch (error) {
      console.error('Error declining proposal:', error);
      alert('Failed to decline proposal');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartChat = (freelancerId: string) => {
    navigate(`/messages?userId=${freelancerId}`);
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
              <h1 className={styles.pageTitle}>
                {activeTab === 'projects' ? 'My Projects' : 'Proposals'}
              </h1>
              <p className={styles.pageSubtitle}>
                {activeTab === 'projects' 
                  ? 'Manage and track all your projects' 
                  : 'Review proposals from freelancers'}
              </p>
            </div>
            <button 
              className={styles.createButton}
              onClick={() => navigate('/client/create-job')}
            >
              <Icon icon="mdi:plus" />
              Create New Project
            </button>
          </div>

          {/* Tab Switcher */}
          <div style={{ 
            display: 'flex', 
            gap: 12, 
            marginBottom: 24,
            borderBottom: '2px solid #e5e7eb',
            paddingBottom: 0
          }}>
            <button
              onClick={() => setActiveTab('projects')}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'projects' ? '3px solid #0ea5e9' : '3px solid transparent',
                color: activeTab === 'projects' ? '#0ea5e9' : '#64748b',
                fontWeight: activeTab === 'projects' ? 600 : 400,
                fontSize: 15,
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginBottom: -2,
              }}
            >
              <Icon icon="mdi:folder-outline" style={{ marginRight: 8, fontSize: 20 }} />
              Projects ({projectStats.total})
            </button>
            <button
              onClick={() => setActiveTab('proposals')}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'proposals' ? '3px solid #0ea5e9' : '3px solid transparent',
                color: activeTab === 'proposals' ? '#0ea5e9' : '#64748b',
                fontWeight: activeTab === 'proposals' ? 600 : 400,
                fontSize: 15,
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginBottom: -2,
              }}
            >
              <Icon icon="mdi:account-multiple" style={{ marginRight: 8, fontSize: 20 }} />
              Proposals ({proposals.length})
            </button>
          </div>

          {/* Stats Cards - Only for Projects Tab */}
          {activeTab === 'projects' && (
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
          )}

          {/* Filter Tabs - Only for Projects Tab */}
          {activeTab === 'projects' && (
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
          )}

          {/* Projects List - Only for Projects Tab */}
          {activeTab === 'projects' && (
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
                    onClick={() => {
                      if (project.freelancerId) {
                        navigate('/client/messages', {
                          state: {
                            freelancerId: project.freelancerId._id,
                            freelancerName: `${project.freelancerId.firstName} ${project.freelancerId.lastName}`,
                            projectId: project._id,
                            projectTitle: project.title,
                          }
                        });
                      }
                    }}
                    style={{ cursor: project.freelancerId ? 'pointer' : 'default' }}
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
          )}

          {/* Proposals List - Only for Proposals Tab */}
          {activeTab === 'proposals' && (
            <div className={styles.projectsSection}>
              {loading ? (
                <div className={styles.loader}>
                  <div className={styles.spinner}></div>
                  <p>Loading proposals...</p>
                </div>
              ) : proposals.length === 0 ? (
                <div className={styles.emptyState}>
                  <Icon icon="mdi:account-search-outline" className={styles.emptyIcon} />
                  <h3>No proposals yet</h3>
                  <p>Freelancers who accept your job proposals will appear here.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
                  {proposals.map((proposal) => (
                    <div
                      key={proposal._id}
                      style={{
                        background: 'white',
                        borderRadius: 12,
                        padding: 20,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        border: proposal.status === 'approved' ? '2px solid #10b981' : '1px solid #e5e7eb',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedProposal(proposal)}
                    >
                      {/* Freelancer Info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <img
                          src={proposal.freelancerId.profileImage || `https://ui-avatars.com/api/?name=${proposal.freelancerId.firstName}+${proposal.freelancerId.lastName}&background=0ea5e9&color=fff`}
                          alt={`${proposal.freelancerId.firstName} ${proposal.freelancerId.lastName}`}
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#1e293b' }}>
                            {proposal.freelancerId.firstName} {proposal.freelancerId.lastName}
                          </h3>
                          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#64748b' }}>
                            {proposal.freelancerId.email}
                          </p>
                          {proposal.status === 'approved' && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              marginTop: 4,
                              padding: '2px 8px',
                              background: '#d1fae5',
                              color: '#10b981',
                              borderRadius: 4,
                              fontSize: 12,
                              fontWeight: 500,
                            }}>
                              <Icon icon="mdi:check-circle" /> Approved
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Job Title */}
                      <div style={{ marginBottom: 12 }}>
                        <p style={{ margin: 0, fontSize: 12, color: '#64748b', fontWeight: 500 }}>Applied for:</p>
                        <p style={{ margin: '4px 0 0', fontSize: 15, fontWeight: 600, color: '#0ea5e9' }}>
                          {proposal.jobId.title}
                        </p>
                      </div>

                      {/* Proposed Rate & Duration */}
                      <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                        <div>
                          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Proposed Rate</p>
                          <p style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 600, color: '#1e293b' }}>
                            ${proposal.proposedRate}
                          </p>
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Duration</p>
                          <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 500, color: '#1e293b' }}>
                            {proposal.estimatedDuration}
                          </p>
                        </div>
                      </div>

                      {/* Skills */}
                      {proposal.freelancerId.skills && proposal.freelancerId.skills.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <p style={{ margin: '0 0 8px', fontSize: 12, color: '#64748b', fontWeight: 500 }}>Skills:</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {proposal.freelancerId.skills.slice(0, 5).map((skill, idx) => (
                              <span
                                key={idx}
                                style={{
                                  padding: '4px 10px',
                                  background: '#e0f2fe',
                                  color: '#0369a1',
                                  borderRadius: 6,
                                  fontSize: 12,
                                  fontWeight: 500,
                                }}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cover Letter Preview */}
                      <div style={{ marginBottom: 16 }}>
                        <p style={{ margin: '0 0 8px', fontSize: 12, color: '#64748b', fontWeight: 500 }}>Cover Letter:</p>
                        <p style={{ 
                          margin: 0, 
                          fontSize: 14, 
                          color: '#475569',
                          lineHeight: 1.5,
                          maxHeight: 60,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {proposal.coverLetter.substring(0, 120)}...
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                        {proposal.status === 'approved' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartChat(proposal.freelancerId._id);
                            }}
                            style={{
                              flex: 1,
                              padding: '10px',
                              background: '#0ea5e9',
                              color: 'white',
                              border: 'none',
                              borderRadius: 8,
                              fontSize: 14,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 8,
                            }}
                          >
                            <Icon icon="mdi:message-text" />
                            Start Chat
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApproveProposal(proposal._id);
                              }}
                              disabled={actionLoading === proposal._id}
                              style={{
                                flex: 1,
                                padding: '10px',
                                background: actionLoading === proposal._id ? '#94a3b8' : '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: 8,
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: actionLoading === proposal._id ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                              }}
                            >
                              <Icon icon="mdi:check" />
                              {actionLoading === proposal._id ? 'Approving...' : 'Approve'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeclineProposal(proposal._id);
                              }}
                              disabled={actionLoading === proposal._id}
                              style={{
                                flex: 1,
                                padding: '10px',
                                background: actionLoading === proposal._id ? '#94a3b8' : '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: 8,
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: actionLoading === proposal._id ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                              }}
                            >
                              <Icon icon="mdi:close" />
                              {actionLoading === proposal._id ? 'Declining...' : 'Decline'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Proposal Detail Modal */}
          {selectedProposal && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: 20,
              }}
              onClick={() => setSelectedProposal(null)}
            >
              <div
                style={{
                  background: 'white',
                  borderRadius: 16,
                  maxWidth: 600,
                  width: '100%',
                  maxHeight: '80vh',
                  overflow: 'auto',
                  padding: 30,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 20 }}>
                  <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Proposal Details</h2>
                  <button
                    onClick={() => setSelectedProposal(null)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      fontSize: 24,
                      cursor: 'pointer',
                      color: '#64748b',
                    }}
                  >
                    ×
                  </button>
                </div>

                {/* Freelancer Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: 16, background: '#f8fafc', borderRadius: 12 }}>
                  <img
                    src={selectedProposal.freelancerId.profileImage || `https://ui-avatars.com/api/?name=${selectedProposal.freelancerId.firstName}+${selectedProposal.freelancerId.lastName}&background=0ea5e9&color=fff`}
                    alt={`${selectedProposal.freelancerId.firstName} ${selectedProposal.freelancerId.lastName}`}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                  <div>
                    <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
                      {selectedProposal.freelancerId.firstName} {selectedProposal.freelancerId.lastName}
                    </h3>
                    <p style={{ margin: '4px 0', color: '#64748b' }}>{selectedProposal.freelancerId.email}</p>
                    {selectedProposal.freelancerId.hourlyRate && (
                      <p style={{ margin: '4px 0', fontWeight: 600, color: '#0ea5e9' }}>
                        ${selectedProposal.freelancerId.hourlyRate}/hr
                      </p>
                    )}
                  </div>
                </div>

                {/* Job & Proposal Info */}
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ marginBottom: 12, fontSize: 16, fontWeight: 600, color: '#64748b' }}>Job</h4>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#0ea5e9' }}>
                    {selectedProposal.jobId.title}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px', fontSize: 14, color: '#64748b' }}>Proposed Rate</h4>
                    <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
                      ${selectedProposal.proposedRate}
                    </p>
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 8px', fontSize: 14, color: '#64748b' }}>Estimated Duration</h4>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#1e293b' }}>
                      {selectedProposal.estimatedDuration}
                    </p>
                  </div>
                </div>

                {/* Skills */}
                {selectedProposal.freelancerId.skills && selectedProposal.freelancerId.skills.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600 }}>Skills</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {selectedProposal.freelancerId.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: '6px 12px',
                            background: '#e0f2fe',
                            color: '#0369a1',
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 500,
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {selectedProposal.freelancerId.bio && (
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600 }}>Bio</h4>
                    <p style={{ margin: 0, lineHeight: 1.6, color: '#475569' }}>
                      {selectedProposal.freelancerId.bio}
                    </p>
                  </div>
                )}

                {/* Cover Letter */}
                <div style={{ marginBottom: 24 }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600 }}>Cover Letter</h4>
                  <p style={{ margin: 0, lineHeight: 1.6, color: '#475569', whiteSpace: 'pre-wrap' }}>
                    {selectedProposal.coverLetter}
                  </p>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 12 }}>
                  {selectedProposal.status === 'approved' ? (
                    <button
                      onClick={() => handleStartChat(selectedProposal.freelancerId._id)}
                      style={{
                        flex: 1,
                        padding: '14px',
                        background: '#0ea5e9',
                        color: 'white',
                        border: 'none',
                        borderRadius: 10,
                        fontSize: 16,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Start Chat
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleApproveProposal(selectedProposal._id)}
                        disabled={actionLoading === selectedProposal._id}
                        style={{
                          flex: 1,
                          padding: '14px',
                          background: actionLoading === selectedProposal._id ? '#94a3b8' : '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: 10,
                          fontSize: 16,
                          fontWeight: 600,
                          cursor: actionLoading === selectedProposal._id ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {actionLoading === selectedProposal._id ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleDeclineProposal(selectedProposal._id)}
                        disabled={actionLoading === selectedProposal._id}
                        style={{
                          flex: 1,
                          padding: '14px',
                          background: actionLoading === selectedProposal._id ? '#94a3b8' : '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: 10,
                          fontSize: 16,
                          fontWeight: 600,
                          cursor: actionLoading === selectedProposal._id ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {actionLoading === selectedProposal._id ? 'Declining...' : 'Decline'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientProjects;
