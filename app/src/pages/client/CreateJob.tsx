import { Icon } from '@iconify/react';
import React, { useState, useEffect } from 'react';
import styles from '../styles/CreateJob.module.css';
import ClientSidebar from './components/ClientSidebar';
import ClientHeader from './components/ClientHeader';
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
      const res = await fetch('http://localhost:5000/api/jobs', {
        method: 'POST',
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
        setTitle('');
        setBudget('');
        setDescription('');
        showSuccess('Job posted successfully!');
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(data.message || 'Failed to create job');
        showError(data.message || 'Failed to create job');
      }
    } catch (err) {
      setError('Server error');
      showError('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex',  background: '#f8fafc', borderRadius:"20px"  }}>
      <ClientSidebar isOpen={false} onClose={() => {}} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius:"20px"   }}>
        <ClientHeader onMenuClick={() => {}} />
        <main className={styles.createJobMain}>
          <div className={styles.leftCol}>
            {/* Your Jobs Section */}
            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>Your Jobs</h2>
              {fetchingJobs ? (
                <div style={{ marginBottom: 12 }}>
                  {/* Skeleton loader for jobs */}
                  {[1,2,3].map((i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10, background: '#f1f5f9', borderRadius: 6, padding: 10 }}>
                      <div style={{ width: '40%', height: 16, background: '#e0e7ef', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
                      <div style={{ width: '80%', height: 12, background: '#e0e7ef', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
                    </div>
                  ))}
                  <style>{`
                    @keyframes pulse {
                      0% { opacity: 1; }
                      50% { opacity: 0.4; }
                      100% { opacity: 1; }
                    }
                  `}</style>
                </div>
              ) : fetchError ? (
                <div style={{ color: '#ef4444', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon icon="mdi:alert-circle-outline" style={{ fontSize: 20 }} /> {fetchError}
                </div>
              ) : jobs.length === 0 ? (
                <div style={{ color: '#64748b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon icon="mdi:folder-open-outline" style={{ fontSize: 20 }} /> No jobs found.
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 20,
                    marginBottom: 12,
                    overflowX: 'auto',
                    paddingBottom: 8,
                    scrollbarWidth: 'thin',
                  }}
                >
                  {jobs.map((job) => (
                      <div
                        key={job._id}
                        style={{
                          minWidth: 300,
                          maxWidth: 20,
                          background: '#fff',
                          borderRadius: 12,
                          boxShadow: '0 2px 8px 0 rgba(30,41,59,0.06)',
                          padding: '10px 8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                          border: '1px solid #f1f5f9',
                          transition: 'box-shadow 0.2s',
                          position: 'relative',
                          flex: '0 0 auto',
                        }}
                      >
                      <div style={{ display: 'fle x', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontWeight: 600, fontSize: 17, color: '#1e293b' }}>{job.title}</div>
                        <span style={{ color: '#f97316', fontWeight: 500, fontSize: 15 }}>
                          {job.budget ? `$${job.budget}` : ''}
                        </span>
                      </div>
                      <div style={{ color: '#64748b', fontSize: 14, marginBottom: 1, minHeight: 18, maxHeight: 40, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {job.description}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 1 }}>
                      </div>
                      <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 13, color: '#64748b' }}>
                        <span><strong>Type:</strong> {job.jobType}</span>
                        <span><strong>Location:</strong> {job.locationType}</span>
                        {job.company && <span><strong>Company:</strong> {job.company}</span>}
                      </div>
                      <div style={{ position: 'absolute', top: 12, right: 18, fontSize: 12, color: '#94a3b8' }}>
                        {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Initial Job Details Section */}
            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>Job Details</h2>
              <p className={styles.sectionSubtitle}>Provide some basic information to get started.</p>
              <div className={styles.grid2col}>
                <div>
                  <label className={styles.label} htmlFor="job-title">Job Title</label>
                  <input className={styles.input} id="job-title" placeholder="e.g., Senior UX/UI Designer" type="text" value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div>
                  <label className={styles.label} htmlFor="budget">Budget (USD)</label>
                  <input className={styles.input} id="budget" placeholder="e.g., $3,000 - $5,000" type="text" value={budget} onChange={e => setBudget(e.target.value)} />
                </div>
                <div>
                  <label className={styles.label} htmlFor="company">Company</label>
                  <input className={styles.input} id="company" placeholder="e.g., Acme Inc." type="text" value={company} onChange={e => setCompany(e.target.value)} />
                </div>
                <div>
                  <label className={styles.label} htmlFor="location">Location</label>
                  <input className={styles.input} id="location" placeholder="e.g., Remote or New York" type="text" value={location} onChange={e => setLocation(e.target.value)} />
                </div>
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
                <div>
                  <label className={styles.label} htmlFor="category">Category</label>
                  <input className={styles.input} id="category" placeholder="e.g., Design, Development" type="text" value={category} onChange={e => setCategory(e.target.value)} />
                </div>
                <div className={styles.colSpan2}>
                  <label className={styles.label} htmlFor="description">Brief Description</label>
                  <textarea className={styles.input} id="description" placeholder="Describe the main responsibilities and goals of the project." rows={3} value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <div className={styles.colSpan2}>
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
                <button className={styles.publishBtn} onClick={handlePublish} disabled={loading}>
                  {loading ? <Icon icon="eos-icons:loading" className={styles.loadingIcon} /> : <Icon icon="mdi:publish" />} Publish Job
                </button>
              </div>
              {success && <div style={{ color: '#10b981', marginTop: 8 }}>Job posted successfully!</div>}
              {error && <div style={{ color: '#ef4444', marginTop: 8 }}>{error}</div>}
            </section>

            {/* Job Post Preview Section */}
            <section className={styles.card}>
              <div className={styles.sectionHeaderRow}>
                <h2 className={styles.sectionTitle}>3. Generated Job Post Preview</h2>
                <div className={styles.sectionActions}>
                  <button className={styles.actionBtn}><Icon icon="mdi:pencil-outline" /> Edit</button>
                  <button className={styles.actionBtn}><Icon icon="mdi:content-copy" /> Copy</button>
                </div>
              </div>
              <div className={styles.previewBox}>
                <h3 className={styles.previewTitle}>Senior UX/UI Designer for Mobile App</h3>
                <p>We are seeking a talented and experienced Senior UX/UI Designer to lead the design of our new flagship mobile application. The ideal candidate will have a strong portfolio of beautiful, user-centric mobile designs and a deep understanding of the entire product development lifecycle.</p>
                <h4>Responsibilities:</h4>
                <ul>
                  <li>Lead the UX/UI design process from concept to final hand-off to engineering.</li>
                  <li>Create wireframes, prototypes, and high-fidelity mockups for our mobile application.</li>
                  <li>Collaborate with product managers and engineers to define and implement innovative solutions.</li>
                  <li>Conduct user research and evaluate user feedback to enhance the user experience.</li>
                </ul>
                <h4>Required Skills:</h4>
                <ul>
                  <li>Proven experience as a UX/UI Designer, with a strong portfolio in mobile design.</li>
                  <li>Proficiency in Figma, Sketch, or other design and prototyping tools.</li>
                  <li>Excellent visual design skills with a sensitivity to user-system interaction.</li>
                  <li>Ability to solve problems creatively and effectively.</li>
                </ul>
                <p><strong>Budget:</strong> $3,000 - $5,000</p>
              </div>
            </section>
          </div>
          <aside className={styles.rightCol}>
            <div className={styles.card}>
              <div className={styles.aiHeader}>
                <Icon icon="mdi:sparkles" style={{ color: '#f97316', fontSize: 28 }} />
                <div>
                  <h2 className={styles.sectionTitle}>Connecta AI</h2>
                  <p className={styles.sectionSubtitle}>Chat to improve your job post.</p>
                </div>
              </div>
              <div className={styles.aiChatBox}>
                <div className={styles.aiMsgRow}>
                  <div className={styles.aiAvatar}><Icon icon="mdi:sparkles" style={{ color: '#f97316' }} /></div>
                  <div>
                    <div className={styles.aiMsgBubble}>
                      <p className={styles.aiMsgSender}>AI Assistant</p>
                      <p>Thanks, Sarah! Based on your input, I've generated a first draft of the job post. How does it look?</p>
                    </div>
                  </div>
                </div>
                <div className={styles.aiMsgRow} style={{ justifyContent: 'flex-end' }}>
                  <div>
                    <div className={styles.userMsgBubble}>
                      <p>Looks good, but can you make the tone more friendly and add a bit about our company culture?</p>
                    </div>
                  </div>
                  <img alt="Profile of Sarah W." className={styles.userAvatar} src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOHQydfSEgHLhN7_gOnerdNmKnVpi5ZyjrtjkU5UupSLl78K8Noord62pWuId4Juu26fifc0lMyTvEfupqErZSsteoI5ympk2sIDszWHvFEhidaxfZ2Cr6cyq7NOEVPReor6URxqcpep3vDSwz4YS1mNoKiHzcFaUwQ3UP3kgXWbDwhFdAyJXpIgfQVDFBcnnTUyiwVrgyJ4tIBOYOzX0va-zoe6xkchSiwRD5MSsePcZMPPcPkiurb57bvVzgbKm3vBYD_y26PmcX" />
                </div>
                <div className={styles.aiMsgRow}>
                  <div className={styles.aiAvatar}><span className="material-icons-outlined" style={{ color: '#f97316' }}>auto_awesome</span></div>
                  <div>
                    <div className={styles.aiMsgBubble}>
                      <p>Of course! I've updated the preview with a friendlier tone and added a section about your collaborative culture. Anything else?</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.aiInputRow}>
                <input className={styles.aiInput} placeholder="e.g., 'Add a required skill...'" type="text" />
                <button className={styles.aiSendBtn}><Icon icon="mdi:send" /></button>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};

export default CreateJob;
