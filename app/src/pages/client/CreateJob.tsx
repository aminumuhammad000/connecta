import { Icon } from '@iconify/react';
import React, { useState, useEffect } from 'react';
import styles from '../styles/CreateJob.module.css';
import ClientSidebar from './components/ClientSidebar';
import ClientHeader from './components/ClientHeader';
const CreateJob: React.FC = () => {
  const [title, setTitle] = useState('');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');

  // Loader and error for posting a job
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for fetching jobs
  const [jobs, setJobs] = useState<any[]>([]);
  const [fetchingJobs, setFetchingJobs] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  // Fetch jobs for current client
  useEffect(() => {
    const fetchJobs = async () => {
      setFetchingJobs(true);
      setFetchError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/jobs/client/my-jobs', {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.jobs)) {
          setJobs(data.jobs);
        } else {
          setFetchError(data.message || 'Failed to fetch jobs');
        }
      } catch (err) {
        setFetchError('Server error');
      } finally {
        setFetchingJobs(false);
      }
    };
    fetchJobs();
  }, [success]);

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
          company: 'Your Company',
          companyLogo: '',
          location: 'Remote',
          locationType: 'remote',
          jobType: 'full-time',
          salary: { min: 0, max: 0, currency: 'USD' },
          requirements: [],
          skills: [],
          experience: 'Not specified',
          category: 'General',
          clientId: null, // Let backend set from auth if possible
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTitle('');
        setBudget('');
        setDescription('');
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(data.message || 'Failed to create job');
      }
    } catch (err) {
      setError('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <ClientSidebar isOpen={false} onClose={() => {}} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
                <ul style={{ marginBottom: 12 }}>
                  {jobs.map((job) => (
                    <li key={job._id} style={{ marginBottom: 8, padding: 8, background: '#f1f5f9', borderRadius: 6 }}>
                      <strong>{job.title}</strong> <span style={{ color: '#64748b' }}>(${job.budget})</span>
                      <div style={{ fontSize: 13, color: '#64748b' }}>{job.description}</div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Initial Job Details Section */}
            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>1. Initial Job Details</h2>
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
                <div className={styles.colSpan2}>
                  <label className={styles.label} htmlFor="description">Brief Description</label>
                  <textarea className={styles.input} id="description" placeholder="Describe the main responsibilities and goals of the project." rows={3} value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <div className={styles.colSpan2}>
                  <label className={styles.label} htmlFor="skills">Required Skills</label>
                  <div className={styles.skillsInputWrap}>
                    {/* Example skills, replace with dynamic logic if needed */}
                    <span className={styles.skillChip}>Figma <button className={styles.removeSkillBtn}>&times;</button></span>
                    <span className={styles.skillChip}>UI Design <button className={styles.removeSkillBtn}>&times;</button></span>
                    <input className={styles.skillsInput} id="skills" placeholder="Add a skill and press Enter" type="text" />
                  </div>
                </div>
              </div>
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
              <div className={styles.publishRow}>
                <button className={styles.publishBtn} onClick={handlePublish} disabled={loading}>
                  {loading ? <Icon icon="eos-icons:loading" className={styles.loadingIcon} /> : <Icon icon="mdi:publish" />} Publish Job
                </button>
              </div>
              {success && <div style={{ color: '#10b981', marginTop: 8 }}>Job posted successfully!</div>}
              {error && <div style={{ color: '#ef4444', marginTop: 8 }}>{error}</div>}
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
