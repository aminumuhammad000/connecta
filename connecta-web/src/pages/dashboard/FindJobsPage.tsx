import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Search, MapPin, CheckCircle2, Building2, Clock, ArrowUpRight, Loader2, ShieldCheck, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jobAPI } from '../../services/api';
import { useCurrency } from '../../contexts/CurrencyContext';
import { VerificationRequestModal } from '../../components/modals/VerificationRequestModal';

export const FindJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const { formatDualPrice } = useCurrency();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [onlyVetted, setOnlyVetted] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const categories = ['All', 'Software Development', 'Design & Creative', 'Data Science & AI', 'Marketing & Sales', 'DevOps & Cloud'];

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await jobAPI.getAllJobs({ limit: 30 });
      if (res.success && Array.isArray(res.data)) {
        setJobs(res.data);
      } else if (Array.isArray(res)) {
        setJobs(res as any);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || job.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Find Jobs & Permanent Contracts
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
            Search milestone gigs, squad roles, & full-time contract opportunities across Africa.
          </p>
        </div>

        <button
          onClick={() => setShowVerifyModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#10B981',
            borderRadius: 'var(--radius-full)',
            padding: '10px 18px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <ShieldCheck size={18} /> Get Connecta Verified ✓
        </button>
      </div>

      {/* Search Bar & Category Filters */}
      <div className="glass-card" style={{ padding: '20px', borderRadius: '18px', marginBottom: '28px', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div className="input-wrapper" style={{ flex: 1, minWidth: '280px' }}>
            <Search className="input-icon-left" size={18} />
            <input
              type="text"
              placeholder="Search by job title, skill, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ width: '100%' }}
            />
          </div>

          <button
            onClick={() => setOnlyVetted(!onlyVetted)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: 'var(--radius-lg)',
              border: onlyVetted ? '1px solid #10B981' : '1px solid var(--border-color)',
              background: onlyVetted ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-secondary)',
              color: onlyVetted ? '#10B981' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <Filter size={16} /> Show Vetted Roles Only
          </button>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid var(--border-color)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: selectedCategory === cat ? 'var(--primary)' : 'var(--bg-tertiary)',
                color: selectedCategory === cat ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.2s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={26} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <span>Searching available jobs...</span>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', borderRadius: '18px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>No jobs match your filter</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Try clearing your search query or selecting a different category.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredJobs.map((job) => (
            <motion.div
              key={job._id || job.id}
              whileHover={{ y: -3, boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}
              transition={{ duration: 0.2 }}
              onClick={() => navigate(`/jobs/${job._id}`)}
              className="glass-card"
              style={{
                padding: '24px',
                borderRadius: '20px',
                border: '1px solid var(--border-color)',
                background: 'var(--card-bg)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                cursor: 'pointer',
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

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {formatDualPrice(Number(job.budget || 0))}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {job.jobType === 'full_time_contract' ? 'Monthly Salary Retainer' : (job.budgetType || 'fixed price')}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {job.description}
              </p>

              {job.skills && job.skills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {job.skills.map((skill: string, idx: number) => (
                    <span key={idx} style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '20px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} /> Est. Delivery: {job.duration || 14} days
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/jobs/${job._id}`);
                  }}
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

      {/* Candidate Verification Request Modal */}
      <VerificationRequestModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
      />
    </DashboardLayout>
  );
};
