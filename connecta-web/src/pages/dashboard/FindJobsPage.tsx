import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Search, MapPin, CheckCircle2, Building2, Clock, ArrowUpRight, ShieldCheck, Filter, Sparkles, Send, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jobAPI, aiAPI, proposalAPI } from '../../services/api';
import { CardSkeleton, MinimalistLoader } from '../../components/common/SkeletonLoader';
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobsCount, setTotalJobsCount] = useState(0);

  // AI Quick Apply Modal States
  const [aiApplyModalJob, setAiApplyModalJob] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiProposalData, setAiProposalData] = useState<{ coverLetter: string; bidAmount: number; estimatedDays: number; matchScore: number } | null>(null);
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [applySuccessMessage, setApplySuccessMessage] = useState('');

  const categories = ['All', '⚡ AI Recommended', 'Software Development', 'Design & Creative', 'Data Science & AI', 'Marketing & Sales', 'DevOps & Cloud'];

  useEffect(() => {
    fetchJobs();
  }, [page, selectedCategory]);

  const fetchJobs = async (searchVal = searchQuery) => {
    setLoading(true);
    try {
      if (selectedCategory === '⚡ AI Recommended') {
        const res = await aiAPI.getRecommendedJobs();
        if (res?.success && Array.isArray(res.data)) {
          const recJobs = res.data.map((item: any) => ({
            ...item.job,
            matchPercentage: item.matchPercentage,
            matchReason: item.matchReason
          }));
          setJobs(recJobs);
          setTotalJobsCount(recJobs.length);
          setTotalPages(1);
        }
      } else {
        const res = await jobAPI.getAllJobs({
          page,
          limit: 15,
          category: selectedCategory === 'All' ? undefined : selectedCategory,
          search: searchVal.trim() || undefined,
        });

        if (res?.success && Array.isArray(res.data)) {
          setJobs(res.data);
          const total = (res as any).total || res.data.length;
          setTotalJobsCount(total);
          setTotalPages(Math.max(1, Math.ceil(total / 15)));
        } else if (Array.isArray(res)) {
          setJobs(res as any);
          setTotalJobsCount((res as any).length);
          setTotalPages(1);
        }
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchJobs(searchQuery);
  };

  const filteredJobs = jobs.filter((job) => {
    if (!onlyVetted) return true;
    return job.clientId?.isVerified || job.isVetted;
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
          <form onSubmit={handleSearchSubmit} className="input-wrapper" style={{ flex: 1, minWidth: '280px' }}>
            <Search className="input-icon-left" size={18} />
            <input
              type="text"
              placeholder="Search by job title, skill, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ width: '100%' }}
            />
          </form>

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
      <MinimalistLoader loading={loading} />
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
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

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} /> Est. Delivery: {job.duration || 14} days
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      setAiApplyModalJob(job);
                      setAiLoading(true);
                      setApplySuccessMessage('');
                      try {
                        const res = await aiAPI.quickApply(job._id);
                        if (res?.data) {
                          setAiProposalData(res.data);
                        }
                      } catch (err) {
                        console.error('AI Apply error:', err);
                      } finally {
                        setAiLoading(false);
                      }
                    }}
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.83rem',
                      borderRadius: '10px',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #FD6730 0%, #FF8F6B 100%)',
                      color: '#fff',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(253,103,48,0.25)'
                    }}
                  >
                    <Sparkles size={14} /> ⚡ AI Apply
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/jobs/${job._id}`);
                    }}
                    className="btn-primary"
                    style={{ padding: '8px 18px', fontSize: '0.83rem', borderRadius: '10px', fontWeight: 700 }}
                  >
                    View Details <ArrowUpRight size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* AI Quick Apply Modal Overlay */}
      {aiApplyModalJob && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'var(--card-bg)', width: '100%', maxWidth: '620px', borderRadius: '24px', padding: '28px', border: '1px solid var(--border-color)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #FD6730 0%, #FF8F6B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>⚡ Connecta AI Quick Apply</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Auto-tailored for {aiApplyModalJob.title}</span>
                </div>
              </div>
              <button onClick={() => setAiApplyModalJob(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {aiLoading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <MinimalistLoader loading={true} />
                <p style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>AI Brain is analyzing your profile skills and drafting tailored pitch...</p>
              </div>
            ) : applySuccessMessage ? (
              <div style={{ padding: '30px', textAlign: 'center', background: 'rgba(34,197,94,0.08)', borderRadius: '16px', border: '1px solid rgba(34,197,94,0.2)' }}>
                <CheckCircle2 size={42} style={{ color: '#22c55e', margin: '0 auto 10px' }} />
                <h4 style={{ margin: '0 0 6px', color: '#22c55e', fontWeight: 800 }}>Proposal Submitted Successfully!</h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{applySuccessMessage}</p>
                <button onClick={() => setAiApplyModalJob(null)} className="btn-primary" style={{ marginTop: '16px', width: '100%' }}>Done</button>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Suggested Bid Price</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{formatDualPrice(aiProposalData?.bidAmount || aiApplyModalJob.budget)}</strong>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Estimated Turnaround</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{aiProposalData?.estimatedDays || 14} Days</strong>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>AI-Generated Tailored Cover Letter</label>
                  <textarea
                    rows={7}
                    value={aiProposalData?.coverLetter || ''}
                    onChange={(e) => setAiProposalData((prev: any) => ({ ...prev, coverLetter: e.target.value }))}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.85rem', lineHeight: 1.5, fontFamily: 'inherit', resize: 'vertical' }}
                  />
                </div>

                <button
                  disabled={submittingProposal}
                  onClick={async () => {
                    setSubmittingProposal(true);
                    try {
                      const res = await proposalAPI.submitProposal({
                        jobId: aiApplyModalJob._id,
                        coverLetter: aiProposalData?.coverLetter || '',
                        bidAmount: aiProposalData?.bidAmount || aiApplyModalJob.budget,
                        estimatedDays: aiProposalData?.estimatedDays || 14,
                        price: aiProposalData?.bidAmount || aiApplyModalJob.budget,
                        deliveryTime: aiProposalData?.estimatedDays || 14
                      });
                      if (res?.success) {
                        setApplySuccessMessage('Your proposal has been submitted directly to the client!');
                      }
                    } catch (err: any) {
                      console.error('Submit proposal error:', err);
                    } finally {
                      setSubmittingProposal(false);
                    }
                  }}
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Send size={16} /> {submittingProposal ? 'Submitting Proposal...' : 'One-Click Confirm & Apply'}
                </button>
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '32px' }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.85rem', opacity: page <= 1 ? 0.5 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
          >
            Previous
          </button>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Page {page} of {totalPages} ({totalJobsCount} Jobs)
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.85rem', opacity: page >= totalPages ? 0.5 : 1, cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
          >
            Next
          </button>
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
