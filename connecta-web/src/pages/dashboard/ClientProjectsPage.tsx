import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Briefcase, Search, ArrowUpRight, PlusCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { projectAPI } from '../../services/api';
import { formatJobBudget } from '../../utils/currency';

export const ClientProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Completed' | 'Submitted'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchClientProjects();
  }, []);

  const fetchClientProjects = async () => {
    setLoading(true);
    try {
      const res = await projectAPI.getClientProjects();
      if (res.success && Array.isArray(res.data)) {
        setProjects(res.data);
      } else if (Array.isArray(res)) {
        setProjects(res as any);
      }
    } catch (err) {
      console.error('Failed to fetch client projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = (p.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === 'Completed') return matchesSearch && p.status === 'completed';
    if (activeFilter === 'Submitted') return matchesSearch && p.status === 'submitted';
    return matchesSearch;
  });

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            My Jobs & Projects
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
            Manage active client job listings, inspect incoming proposals, and review submitted deliverables.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/jobs/new')}
          className="btn-primary"
          style={{ padding: '10px 20px', borderRadius: '12px', fontWeight: 700, fontSize: '0.88rem' }}
        >
          <PlusCircle size={17} /> Post a Job
        </motion.button>
      </div>

      {/* Filter Chips & Search Bar */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search projects by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '40px', width: '100%', borderRadius: '12px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {(['All', 'Submitted', 'Completed'] as const).map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveFilter(chip)}
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                border: activeFilter === chip ? 'none' : '1px solid var(--border-color)',
                background: activeFilter === chip ? 'var(--primary)' : 'var(--card-bg)',
                color: activeFilter === chip ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {chip === 'Submitted' ? 'To Review' : chip}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={26} className="animate-spin" style={{ margin: '0 auto 10px' }} />
          <span>Loading client project postings...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', borderRadius: '20px' }}>
          <Briefcase size={32} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 6px' }}>No projects found</h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            You haven't posted any jobs under this status filter yet.
          </p>
          <button onClick={() => navigate('/jobs/new')} className="btn-primary" style={{ padding: '10px 20px' }}>
            Post a Project Now
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredProjects.map((p) => (
            <motion.div
              key={p._id}
              whileHover={{ y: -2 }}
              className="glass-card"
              style={{
                padding: '24px',
                borderRadius: '20px',
                border: '1px solid var(--border-color)',
                background: 'var(--card-bg)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ flex: 1, paddingRight: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '8px', background: 'rgba(253,103,48,0.1)', color: 'var(--primary)' }}>
                    {p.category || 'Software Development'}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>
                    {p.status || 'Active Posting'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                  {p.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                  {p.description}
                </p>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end', flexShrink: 0 }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {formatJobBudget(Number(p.budget || 0), p.currency)}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {p.status === 'completed' && (
                    <button
                      onClick={() => navigate('/client/reviews/new', { state: { projectId: p._id, revieweeId: p.freelancerId?._id || p.freelancerId, freelancerName: p.freelancerId ? `${p.freelancerId.firstName} ${p.freelancerId.lastName}` : 'Usman Umar', jobTitle: p.title } })}
                      style={{ padding: '8px 14px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, background: 'rgba(253,103,48,0.1)', color: 'var(--primary)', border: '1px solid var(--primary)', cursor: 'pointer' }}
                    >
                      ⭐ Write Review
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/jobs/${p._id}`)}
                    className="btn-primary"
                    style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700 }}
                  >
                    Inspect Details <ArrowUpRight size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};
