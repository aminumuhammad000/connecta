import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Bookmark, Building2, MapPin, CheckCircle2, ArrowUpRight, Clock, Trash2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jobAPI } from '../../services/api';

export const SavedGigsPage: React.FC = () => {
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedGigs();
  }, []);

  const fetchSavedGigs = async () => {
    setLoading(true);
    try {
      const res = await jobAPI.getAllJobs({ limit: 10 });
      if (res.success && Array.isArray(res.data)) {
        setSavedJobs(res.data.slice(0, 3));
      } else if (Array.isArray(res)) {
        setSavedJobs((res as any).slice(0, 3));
      }
    } catch (err) {
      console.error('Failed to load saved gigs:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeSavedGig = (id: string) => {
    setSavedJobs((prev) => prev.filter((j) => (j._id || j.id) !== id));
  };

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Saved Gigs & Projects
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
          Quickly access bookmarked client postings to submit proposals when you are ready.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={26} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <span>Loading saved gigs...</span>
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(253,103,48,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Bookmark size={26} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>No saved gigs yet</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '380px', margin: '0 auto 24px' }}>
            Click the heart bookmark icon on any job card to save it to this collection for easy access.
          </p>
          <button onClick={() => navigate('/jobs')} className="btn-primary" style={{ padding: '12px 22px', fontSize: '0.88rem' }}>
            Browse Available Jobs
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {savedJobs.map((job) => (
            <motion.div
              key={job._id || job.id}
              whileHover={{ y: -2 }}
              className="glass-card"
              style={{
                padding: '24px',
                borderRadius: '20px',
                border: '1px solid var(--border-color)',
                background: 'var(--card-bg)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', background: 'rgba(253,103,48,0.09)', color: 'var(--primary)' }}>
                      {job.category || 'Software'}
                    </span>
                    {job.paymentVerified && (
                      <span title="Verified Client" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(253,103,48,0.12)', color: 'var(--primary)' }}>
                        <CheckCircle2 size={13} strokeWidth={2.5} />
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                    {job.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      <Building2 size={13} /> {job.company || 'Direct Client'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={13} /> {job.location || 'Remote'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => removeSavedGig(job._id || job.id)}
                    title="Remove from saved"
                    style={{ background: 'var(--bg-tertiary)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}
                  >
                    <Trash2 size={16} />
                  </button>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>
                      ₦{Number(job.budget || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {job.description}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} /> Est. Delivery: {job.duration || 14} days
                </span>
                <button
                  onClick={() => navigate(`/jobs/${job._id}`)}
                  className="btn-primary"
                  style={{ padding: '8px 18px', fontSize: '0.83rem', borderRadius: '10px', fontWeight: 700 }}
                >
                  Apply Now <ArrowUpRight size={15} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};
