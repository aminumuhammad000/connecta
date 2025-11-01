import { Icon } from '@iconify/react';
import React, { useState, useEffect } from 'react';
import styles from '../styles/CreateJob.module.css';
import ClientSidebar from './components/ClientSidebar';
import ClientHeader from './components/ClientHeader';
import ConnectaAI from '../ConnectaAI/ConnectaAI';
import { useNotification } from '../../contexts/NotificationContext';
const CreateJob: React.FC = () => {
  const [title, setTitle] = useState('');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('full-time');
  const [locationType, setLocationType] = useState('remote');
  const [experience, setExperience] = useState('');
  const [category, setCategory] = useState('');

  // Loader and error for posting a job
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useNotification();

  // State for fetching jobs
  const [jobs, setJobs] = useState<any[]>([]);
  const [fetchingJobs, setFetchingJobs] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Skills input state
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const togglePreview = () => {
    setIsPreview(!isPreview);
  };

  const handleSkillInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  // Load job details for editing
  const handleEditJob = (job: any) => {
    setSelectedJobId(job._id);
    setTitle(job.title || '');
    setBudget(job.budget || '');
    setDescription(job.description || '');
    setCompany(job.company || '');
    setLocation(job.location || '');
    setJobType(job.jobType || 'full-time');
    setLocationType(job.locationType || 'remote');
    setExperience(job.experience || '');
    setCategory(job.category || '');
    setSkills(job.skills || []);
    setIsPreview(false);
    showSuccess('Job loaded for editing');
  };

  // Delete job
  const handleDeleteJob = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when deleting
    if (!window.confirm('Are you sure you want to delete this job?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('Job deleted successfully!');
        setJobs(jobs.filter(job => job._id !== jobId));
        // Clear form if editing this job
        if (selectedJobId === jobId) {
          setSelectedJobId(null);
          setTitle('');
          setBudget('');
          setDescription('');
          setCompany('');
          setLocation('');
          setJobType('full-time');
          setLocationType('remote');
          setExperience('');
          setCategory('');
          setSkills([]);
        }
      } else {
        showError(data.message || 'Failed to delete job');
      }
    } catch (err) {
      showError('Server error');
    }
  };

  // Clear form
  const handleClearForm = () => {
    setSelectedJobId(null);
    setTitle('');
    setBudget('');
    setDescription('');
    setCompany('');
    setLocation('');
    setJobType('full-time');
    setLocationType('remote');
    setExperience('');
    setCategory('');
    setSkills([]);
    setIsPreview(false);
  };
  // Fetch jobs for current client
  useEffect(() => {
    const fetchJobs = async () => {
      setFetchingJobs(true);
      setFetchError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setFetchError('You must be logged in to view your jobs.');
        showError('You must be logged in to view your jobs.');
        setFetchingJobs(false);
        return;
      }
      try {
        const res = await fetch('http://localhost:5000/api/jobs/client/my-jobs', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        let data;
        try {
          data = await res.json();
        } catch (jsonErr) {
          console.error('Failed to parse jobs response as JSON:', jsonErr);
          setFetchError('Invalid server response');
          return;
        }
        if (!res.ok) {
          console.error('Fetch jobs error:', res.status, data);
        }
        if (data.success && Array.isArray(data.data)) {
          setJobs(data.data);
        } else {
          setFetchError(data.message || 'Failed to fetch jobs');
        }
      } catch (err) {
        console.error('Fetch jobs network/server error:', err);
        setFetchError('Server error');
      } finally {
        setFetchingJobs(false);
      }
    };
    fetchJobs();
  }, [success, showError]);

  const handlePublish = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const url = selectedJobId 
        ? `http://localhost:5000/api/jobs/${selectedJobId}` 
        : 'http://localhost:5000/api/jobs';
      const method = selectedJobId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title,
          description,
          budget,
          company,
          companyLogo: '',
          location,
          locationType,
          jobType,
          salary: { min: 0, max: 0, currency: 'USD' },
          requirements: [],
          skills,
          experience,
          category,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        const successMessage = selectedJobId ? 'Job updated successfully!' : 'Job posted successfully!';
        showSuccess(successMessage);
        handleClearForm();
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(data.message || 'Failed to save job');
        showError(data.message || 'Failed to save job');
      }
    } catch (err) {
      setError('Server error');
      showError('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh', borderRadius: '20px' }}>
      <ClientSidebar isOpen={false} onClose={() => {}} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: '20px' }}>
        <ClientHeader onMenuClick={() => {}} />
        <main className={styles.createJobMain} style={{ height: '80vh', overflowY: 'auto' }}>
          <div className={styles.leftCol}>
            {/* Your Jobs Section */}
            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>Your Jobs</h2>
              {fetchingJobs ? (
                <div style={{ marginBottom: 12 }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      marginBottom: 10,
                      background: '#f1f5f9',
                      borderRadius: 6,
                      padding: 10
                    }}>
                      <div style={{
                        width: '40%',
                        height: 16,
                        background: '#e0e7ef',
                        borderRadius: 4,
                        animation: 'pulse 1.5s infinite'
                      }} />
                      <div style={{
                        width: '80%',
                        height: 12,
                        background: '#e0e7ef',
                        borderRadius: 4,
                        animation: 'pulse 1.5s infinite'
                      }} />
                    </div>
                  ))}
                  <style>{
                    `@keyframes pulse {
                      0% { opacity: 1; }
                      50% { opacity: 0.4; }
                      100% { opacity: 1; }
                    }`
                  }</style>
                </div>
              ) : fetchError ? (
                <div style={{
                  color: '#ef4444',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <Icon icon="mdi:alert-circle-outline" style={{ fontSize: 20 }} />
                  {fetchError}
                </div>
              ) : jobs.length === 0 ? (
                <div style={{
                  color: '#64748b',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <Icon icon="mdi:folder-open-outline" style={{ fontSize: 20 }} />
                  No jobs found.
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 20,
                  marginBottom: 12,
                  overflowX: 'auto',
                  paddingBottom: 8,
                  scrollbarWidth: 'thin',
                }}>
                  {jobs.map((job) => (
                    <div
                      key={job._id}
                      onClick={() => handleEditJob(job)}
                      style={{
                        minWidth: 300,
                        maxWidth: 400,
                        background: '#fff',
                        borderRadius: 12,
                        boxShadow: selectedJobId === job._id ? '0 4px 12px 0 rgba(14,165,233,0.3)' : '0 2px 8px 0 rgba(30,41,59,0.06)',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        border: selectedJobId === job._id ? '2px solid #0ea5e9' : '1px solid #f1f5f9',
                        transition: 'all 0.2s',
                        position: 'relative',
                        flex: '0 0 auto',
                        cursor: 'pointer',
                      }}
                    >
                      {/* Delete Icon */}
                      <button
                        onClick={(e) => handleDeleteJob(job._id, e)}
                        style={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          background: '#fee2e2',
                          border: 'none',
                          borderRadius: '50%',
                          width: 28,
                          height: 28,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#dc2626',
                          transition: 'all 0.2s',
                          zIndex: 10,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#dc2626';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#fee2e2';
                          e.currentTarget.style.color = '#dc2626';
                        }}
                        title="Delete job"
                      >
                        <Icon icon="mdi:delete-outline" style={{ fontSize: 18 }} />
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 30 }}>
                        <div style={{ fontWeight: 600, fontSize: 17, color: '#1e293b' }}>{job.title || 'Untitled'}</div>
                        <span style={{ color: '#f97316', fontWeight: 500, fontSize: 15 }}>
                          {job.budget ? `$${job.budget}` : ''}
                        </span>
                      </div>
                      <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
                        {job.description || 'No description'}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                        {job.skills?.slice(0, 3).map((skill: string, idx: number) => (
                          <span key={idx} style={{
                            background: '#e0f2fe',
                            color: '#0369a1',
                            padding: '4px 8px',
                            borderRadius: 4,
                            fontSize: 12
                          }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 13, color: '#64748b' }}>
                        <span><strong>Type:</strong> {job.jobType}</span>
                        <span><strong>Location:</strong> {job.locationType}</span>
                      </div>
                      {selectedJobId === job._id && (
                        <div style={{
                          position: 'absolute',
                          bottom: 8,
                          left: 8,
                          background: '#0ea5e9',
                          color: 'white',
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                        }}>
                          Editing
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Create New Job Section */}
            <section className={styles.card} style={{ display: isPreview ? 'none' : 'block' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
                  {selectedJobId ? 'Edit Job' : 'Create New Job'}
                </h2>
                {selectedJobId && (
                  <button
                    type="button"
                    onClick={handleClearForm}
                    style={{
                      background: '#f1f5f9',
                      color: '#64748b',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 14,
                      fontWeight: 500,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#e2e8f0';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f1f5f9';
                    }}
                  >
                    <Icon icon="mdi:close" /> Cancel Edit
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Row 1: Job Title and Budget */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label className={styles.label} htmlFor="title">Job Title</label>
                    <input className={styles.input} id="title" placeholder="e.g., Senior React Developer" type="text" value={title} onChange={e => setTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className={styles.label} htmlFor="budget">Budget (USD)</label>
                    <input className={styles.input} id="budget" placeholder="e.g., $3,000 - $5,000" type="text" value={budget} onChange={e => setBudget(e.target.value)} />
                  </div>
                </div>

                {/* Row 2: Company and Location */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label className={styles.label} htmlFor="company">Company</label>
                    <input className={styles.input} id="company" placeholder="e.g., Acme Inc." type="text" value={company} onChange={e => setCompany(e.target.value)} />
                  </div>
                  <div>
                    <label className={styles.label} htmlFor="location">Location</label>
                    <input className={styles.input} id="location" placeholder="e.g., Remote or New York" type="text" value={location} onChange={e => setLocation(e.target.value)} />
                  </div>
                </div>

                {/* Row 3: Job Type, Location Type, and Experience */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div>
                    <label className={styles.label} htmlFor="jobType">Job Type</label>
                    <select className={styles.input} id="jobType" value={jobType} onChange={e => setJobType(e.target.value)}>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="freelance">Freelance</option>
                    </select>
                  </div>
                  <div>
                    <label className={styles.label} htmlFor="locationType">Location Type</label>
                    <select className={styles.input} id="locationType" value={locationType} onChange={e => setLocationType(e.target.value)}>
                      <option value="remote">Remote</option>
                      <option value="onsite">Onsite</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className={styles.label} htmlFor="experience">Experience</label>
                    <input className={styles.input} id="experience" placeholder="e.g., 3+ years" type="text" value={experience} onChange={e => setExperience(e.target.value)} />
                  </div>
                </div>

                {/* Row 4: Category (Full Width) */}
                <div>
                  <label className={styles.label} htmlFor="category">Category</label>
                  <input className={styles.input} id="category" placeholder="e.g., Design, Development" type="text" value={category} onChange={e => setCategory(e.target.value)} />
                </div>

                {/* Row 5: Description (Full Width) */}
                <div>
                  <label className={styles.label} htmlFor="description">Brief Description</label>
                  <textarea 
                    className={styles.input} 
                    id="description" 
                    placeholder="Describe the main responsibilities and goals of the project." 
                    rows={3} 
                    value={description} 
                    onChange={e => setDescription(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {/* Row 6: Skills (Full Width) */}
                <div>
                  <label className={styles.label} htmlFor="skills">Required Skills</label>
                  <div className={styles.skillsInputWrap}>
                    {skills.map(skill => (
                      <span key={skill} className={styles.skillChip}>
                        {skill} <button type="button" className={styles.removeSkillBtn} onClick={() => handleRemoveSkill(skill)}>&times;</button>
                      </span>
                    ))}
                    <input
                      className={styles.skillsInput}
                      id="skills"
                      placeholder="Add a skill and press Enter"
                      type="text"
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={handleSkillInputKeyDown}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.publishRow}>
                <button 
                  type="button"
                  className={`${styles.actionBtn} ${styles.previewBtn}`} 
                  onClick={togglePreview}
                >
                  <Icon icon="mdi:eye-outline" /> Preview
                </button>
                <button 
                  className={styles.publishBtn} 
                  onClick={handlePublish} 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Icon icon="eos-icons:loading" className={styles.loadingIcon} />
                      {selectedJobId ? 'Updating...' : 'Publishing...'}
                    </>
                  ) : (
                    <>
                      <Icon icon={selectedJobId ? "mdi:content-save" : "mdi:publish"} />
                      {selectedJobId ? 'Update Job' : 'Publish Job'}
                    </>
                  )}
                </button>
              </div>
              {success && <div style={{ color: '#10b981', marginTop: 8 }}>Job posted successfully!</div>}
              {error && <div style={{ color: '#ef4444', marginTop: 8 }}>{error}</div>}
            </section>

            {/* Job Post Preview Section */}
            <section className={styles.card} style={{ display: isPreview ? 'block' : 'none' }}>
              <div className={styles.sectionHeaderRow}>
                <h2 className={styles.sectionTitle}>Job Post Preview</h2>
                <div className={styles.sectionActions}>
                  <button 
                    className={styles.actionBtn}
                    onClick={togglePreview}
                  >
                    <Icon icon="mdi:pencil-outline" /> Edit
                  </button>
                  <button 
                    className={styles.actionBtn}
                    onClick={() => {
                      const previewText = `
Job Title: ${title || 'Untitled Job Posting'}
${company ? `Company: ${company}\n` : ''}
Description: ${description || 'No description provided.'}

Job Type: ${jobType.charAt(0).toUpperCase() + jobType.slice(1).replace('-', ' ')}
Location Type: ${locationType.charAt(0).toUpperCase() + locationType.slice(1)}
${location ? `Location: ${location}\n` : ''}
${experience ? `Experience: ${experience}\n` : ''}
${category ? `Category: ${category}\n` : ''}
${budget ? `Budget: ${budget}\n` : ''}
${skills.length > 0 ? `\nRequired Skills:\n${skills.map(s => `- ${s}`).join('\n')}` : ''}
                      `.trim();
                      
                      navigator.clipboard.writeText(previewText).then(() => {
                        showSuccess('Job details copied to clipboard!');
                      }).catch(() => {
                        showError('Failed to copy to clipboard');
                      });
                    }}
                  >
                    <Icon icon="mdi:content-copy" /> Copy
                  </button>
                </div>
              </div>
              <div className={styles.previewBox}>
                <h3 className={styles.previewTitle}>{title || 'Untitled Job Posting'}</h3>
                {company && <p><strong>Company:</strong> {company}</p>}
                <p>{description || 'No description provided.'}</p>
                
                <div className={styles.previewDetails}>
                  <p><strong>Job Type:</strong> {jobType.charAt(0).toUpperCase() + jobType.slice(1).replace('-', ' ')}</p>
                  <p><strong>Location Type:</strong> {locationType.charAt(0).toUpperCase() + locationType.slice(1)}</p>
                  {location && <p><strong>Location:</strong> {location}</p>}
                  {experience && <p><strong>Experience:</strong> {experience}</p>}
                  {category && <p><strong>Category:</strong> {category}</p>}
                  {budget && <p><strong>Budget:</strong> {budget}</p>}
                </div>

                {skills.length > 0 && (
                  <>
                    <h4>Required Skills:</h4>
                    <ul>
                      {skills.map((skill, index) => (
                        <li key={index}>{skill}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
              
              {/* Publish Button in Preview */}
              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button 
                  type="button"
                  className={`${styles.actionBtn} ${styles.previewBtn}`} 
                  onClick={togglePreview}
                  style={{ 
                    background: '#64748b',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <Icon icon="mdi:pencil-outline" /> Back to Edit
                </button>
                <button 
                  className={styles.publishBtn} 
                  onClick={handlePublish} 
                  disabled={loading}
                  style={{ 
                    background: loading ? '#94a3b8' : '#0ea5e9',
                    color: 'white',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: 8,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontWeight: 600
                  }}
                >
                  {loading ? (
                    <>
                      <Icon icon="eos-icons:loading" />
                      {selectedJobId ? 'Updating...' : 'Publishing...'}
                    </>
                  ) : (
                    <>
                      <Icon icon={selectedJobId ? "mdi:content-save" : "mdi:publish"} />
                      {selectedJobId ? 'Update Job' : 'Publish Job'}
                    </>
                  )}
                </button>
              </div>
              
              {success && <div style={{ color: '#10b981', marginTop: 12, textAlign: 'center', fontWeight: 500 }}>✓ Job posted successfully!</div>}
              {error && <div style={{ color: '#ef4444', marginTop: 12, textAlign: 'center' }}>{error}</div>}
            </section>
          </div>
          <aside className={styles.rightCol}>
            {/* <div className={styles.card}> */}
              <ConnectaAI />
              
            {/* </div> */}
          </aside>
        </main>
      </div>
    </div>
  );
};

export default CreateJob;
