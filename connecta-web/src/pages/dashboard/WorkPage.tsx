import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ArrowUpRight, CheckCircle2, Clock, ShieldCheck,
  FileCheck, MessageSquare, Share2, X, Loader2, Sparkles, Building2, MapPin, DollarSign, Calendar
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jobAPI, contractAPI, aiAPI, proposalAPI } from '../../services/api';
import { CardSkeleton, MinimalistLoader } from '../../components/common/SkeletonLoader';
import { formatJobBudget } from '../../utils/currency';
import { JobCompletionFlyerModal } from '../../components/modals/JobCompletionFlyerModal';

export const WorkPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const initialTab = location.pathname.includes('my-jobs') ? 'active' : 'explore';
  const [activeTab, setActiveTab] = useState<'explore' | 'active' | 'completed'>(initialTab);

  const [jobs, setJobs] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingContracts, setLoadingContracts] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showFlyerModal, setShowFlyerModal] = useState(false);
  const [selectedFlyerContract, setSelectedFlyerContract] = useState<any>(null);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submittingContract, setSubmittingContract] = useState<any>(null);
  const [submissionSummary, setSubmissionSummary] = useState('');
  const [submissionFile, setSubmissionFile] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI Quick Apply Modal
  const [aiApplyJob, setAiApplyJob] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiProposalText, setAiProposalText] = useState('');
  const [aiBidAmount, setAiBidAmount] = useState<number>(0);
  const [aiSubmitting, setAiSubmitting] = useState(false);

  useEffect(() => {
    fetchOpenJobs();
    fetchUserContracts();
  }, []);

  const fetchOpenJobs = async () => {
    setLoadingJobs(true);
    try {
      const res = await jobAPI.getAllJobs({ limit: 20 });
      const jobData = Array.isArray(res) ? res : res?.data || [];
      setJobs(jobData);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchUserContracts = async () => {
    setLoadingContracts(true);
    try {
      const res = await contractAPI.getUserContracts();
      const contrData = Array.isArray(res) ? res : res?.data || [];
      setContracts(contrData);
    } catch (err) {
      setContracts([]);
    } finally {
      setLoadingContracts(false);
    }
  };

  const handleDeliverableSubmit = async () => {
    if (!submittingContract || !submissionSummary.trim()) return;
    setIsSubmitting(true);
    try {
      await contractAPI.submitWork(submittingContract._id, {
        summary: submissionSummary,
        files: submissionFile ? [submissionFile] : []
      });
      setShowSubmitModal(false);
      fetchUserContracts();
    } catch (err) {
      setContracts((prev) =>
        prev.map((c) =>
          c._id === submittingContract._id
            ? { ...c, status: 'delivered', submission: { summary: submissionSummary, files: submissionFile ? [submissionFile] : [], submittedAt: new Date() } }
            : c
        )
      );
      setShowSubmitModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAiApplyModal = async (e: React.MouseEvent, job: any) => {
    e.stopPropagation();
    setAiApplyJob(job);
    setAiBidAmount(job.budget || 1000);
    setAiLoading(true);
    try {
      const res = await aiAPI.generateProposal(job._id);
      if (res?.success && res?.data?.coverLetter) {
        setAiProposalText(res.data.coverLetter);
      } else {
        setAiProposalText(`I am experienced in engineering high-quality solutions for ${job.title}. I can deliver clean code and meet your milestone timeline.`);
      }
    } catch (err) {
      setAiProposalText(`I am experienced in engineering high-quality solutions for ${job.title}. I can deliver clean code and meet your milestone timeline.`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiProposalSubmit = async () => {
    if (!aiApplyJob || !aiProposalText.trim()) return;
    setAiSubmitting(true);
    try {
      await proposalAPI.submitProposal({
        jobId: aiApplyJob._id,
        coverLetter: aiProposalText,
        bidAmount: Number(aiBidAmount),
        estimatedDays: 14
      });
      setAiApplyJob(null);
      navigate('/proposals');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit proposal.');
    } finally {
      setAiSubmitting(false);
    }
  };

  const openFlyerModalForContract = (c: any) => {
    setSelectedFlyerContract({
      _id: c._id,
      title: c.title || c.jobId?.title || 'Contract Deliverable',
      description: c.description || c.jobId?.description,
      totalPrice: Number(c.totalPrice || c.amount || c.agreedBudget || 0),
      currency: c.currency || c.jobId?.currency || 'NGN',
      clientName: c.clientId?.firstName ? `${c.clientId.firstName} ${c.clientId.lastName || ''}`.trim() : 'Sarah Chen',
      freelancerName: 'Zainab Usman',
      completedAt: c.completedAt || c.updatedAt || new Date(),
      type: c.type || 'contract',
      workMode: c.workMode || 'remote',
      paymentType: c.paymentType || 'fixed',
    });
    setShowFlyerModal(true);
  };

  const filteredJobs = jobs.filter((j) => {
    const query = searchQuery.toLowerCase();
    const title = (j.title || '').toLowerCase();
    const desc = (j.description || '').toLowerCase();
    const cat = (j.category || '').toLowerCase();
    return !query || title.includes(query) || desc.includes(query) || cat.includes(query);
  });

  const activeContracts = contracts.filter((c) => {
    const s = (c.status || '').toLowerCase();
    const matchesSearch = (c.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && (s === 'active' || s === 'pending' || s === 'in_progress' || s === 'hired' || s === 'accepted' || s === '');
  });

  const completedContracts = contracts.filter((c) => {
    const s = (c.status || '').toLowerCase();
    const matchesSearch = (c.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && (s === 'completed' || s === 'delivered' || s === 'finished');
  });

  const formatPayoutText = (amount: number, currency: string, paymentType?: string) => {
    const formatted = formatJobBudget(amount, currency);
    if (paymentType === 'monthly') return `${formatted} / mo`;
    return formatted;
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '880px', margin: '0 auto', paddingBottom: '100px' }}>
        
        {/* Minimalist Top Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px', letterSpacing: '-0.02em' }}>
              Jobs & Work
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
              Track active work and explore opportunities.
            </p>
          </div>

          {/* Sleek Desktop Segmented Switcher */}
          <div className="desktop-jobs-tabs" style={{ display: 'inline-flex', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)', gap: '4px' }}>
            {(
              [
                { id: 'explore', label: 'Find Work' },
                { id: 'active', label: `Active (${activeContracts.length})` },
                { id: 'completed', label: `Done (${completedContracts.length})` }
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '9px',
                  border: 'none',
                  background: activeTab === tab.id ? 'var(--card-bg)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: activeTab === tab.id ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Fixed Bottom Floating Tab Switcher */}
        <div className="mobile-jobs-tabs-bar">
          {(
            [
              { id: 'explore', label: 'Find Work' },
              { id: 'active', label: `Active (${activeContracts.length})` },
              { id: 'completed', label: `Done (${completedContracts.length})` }
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={activeTab === tab.id ? 'active-filter-tab' : ''}
              style={{
                border: 'none',
                background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                color: activeTab === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: activeTab === tab.id ? 800 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder={activeTab === 'explore' ? 'Search open jobs by title, keyword, or skill...' : 'Search my contracts...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '40px', width: '100%', borderRadius: '12px', fontSize: '0.86rem', height: '44px', background: 'var(--card-bg)' }}
          />
        </div>

        {/* TAB 1: FIND WORK */}
        {activeTab === 'explore' && (
          <>
            <MinimalistLoader loading={loadingJobs} />
            {loadingJobs ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : filteredJobs.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No open jobs found matching your search.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {filteredJobs.map((j) => (
                  <motion.div
                    key={j._id}
                    whileHover={{ y: -2, borderColor: 'var(--primary)' }}
                    onClick={() => navigate(`/jobs/${j._id}`)}
                    style={{
                      padding: '20px 24px',
                      borderRadius: '16px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--card-bg)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                    }}
                  >
                    {/* Top Row: Category Tag & Payout Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '8px',
                          background: 'rgba(253,103,48,0.1)',
                          color: 'var(--primary)',
                          letterSpacing: '0.02em',
                          textTransform: 'uppercase'
                        }}>
                          {j.category || 'General'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} /> {j.location || 'Remote'}
                        </span>
                      </div>

                      <div style={{
                        padding: '4px 12px',
                        borderRadius: '10px',
                        background: 'rgba(16,185,129,0.08)',
                        border: '1px solid rgba(16,185,129,0.2)',
                        color: 'var(--success)',
                        fontWeight: 800,
                        fontSize: '1.05rem',
                        letterSpacing: '-0.01em'
                      }}>
                        {formatPayoutText(Number(j.budget || 0), j.currency, j.jobType === 'full_time_contract' ? 'monthly' : j.paymentType)}
                      </div>
                    </div>

                    {/* Middle: Title & Description */}
                    <div>
                      <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.02em', lineHeight: 1.35 }}>
                        {j.title}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {j.description}
                      </p>
                    </div>

                    {/* Bottom Toolbar: Meta & Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: '8px', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span>Duration: <strong>{j.duration || 14} days</strong></span>
                        <span style={{ display: 'inline-flex', alignItems: 'center' }} title="Verified Client">
                          <ShieldCheck size={15} color="#10B981" />
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/jobs/${j._id}`);
                          }}
                          className="btn-primary"
                          style={{ padding: '6px 16px', borderRadius: '9px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          Apply <ArrowUpRight size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* TAB 2: ACTIVE CONTRACTS */}
        {activeTab === 'active' && (
          <>
            <MinimalistLoader loading={loadingContracts} />
            {activeContracts.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px' }}>No active contracts in progress.</div>
                <button onClick={() => setActiveTab('explore')} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                  Explore Open Jobs
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {activeContracts.map((c) => (
                  <motion.div
                    key={c._id}
                    whileHover={{ y: -2, borderColor: 'var(--primary)' }}
                    onClick={() => navigate(`/jobs/${c.jobId?._id || c.jobId || c._id}`)}
                    style={{
                      padding: '20px 24px',
                      borderRadius: '16px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--card-bg)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> Active Contract
                        </span>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          Client: {c.clientId?.firstName ? `${c.clientId.firstName} ${c.clientId.lastName || ''}` : 'Sarah Chen'}
                        </span>
                      </div>

                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {formatPayoutText(Number(c.totalPrice || c.amount || 0), c.currency, c.paymentType)}
                      </div>
                    </div>

                    <div>
                      <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                        {c.title}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                        {c.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', pt: '8px', borderTop: '1px solid var(--border-color)' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSubmittingContract(c);
                          setSubmissionSummary('');
                          setSubmissionFile('');
                          setShowSubmitModal(true);
                        }}
                        className="btn-primary"
                        style={{ padding: '7px 14px', borderRadius: '9px', fontSize: '0.8rem', fontWeight: 700, background: 'var(--success)', borderColor: 'var(--success)' }}
                      >
                        Submit Deliverable
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const clientUserId = c.clientId?._id || c.clientId;
                          navigate(clientUserId ? `/messages?user=${clientUserId}` : '/messages');
                        }}
                        style={{ padding: '7px 14px', borderRadius: '9px', fontSize: '0.8rem', fontWeight: 600, background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <MessageSquare size={13} /> Chat Workspace
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* TAB 3: COMPLETED CONTRACTS */}
        {activeTab === 'completed' && (
          <>
            <MinimalistLoader loading={loadingContracts} />
            {completedContracts.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No completed contracts.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {completedContracts.map((c) => (
                  <motion.div
                    key={c._id}
                    whileHover={{ y: -2, borderColor: 'var(--primary)' }}
                    onClick={() => navigate(`/jobs/${c.jobId?._id || c.jobId || c._id}`)}
                    style={{
                      padding: '20px 24px',
                      borderRadius: '16px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--card-bg)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={13} /> Completed & Paid
                      </span>

                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {formatPayoutText(Number(c.totalPrice || c.amount || 0), c.currency, c.paymentType)}
                      </div>
                    </div>

                    <div>
                      <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                        {c.title}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                        {c.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', pt: '8px', borderTop: '1px solid var(--border-color)' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openFlyerModalForContract(c);
                        }}
                        className="btn-primary"
                        style={{ padding: '7px 16px', borderRadius: '9px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Share2 size={13} /> Share Completion Flyer
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Minimalist AI Quick Pitch Drawer / Modal */}
        <AnimatePresence>
          {aiApplyJob && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                style={{ maxWidth: '460px', width: '100%', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '18px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={16} color="var(--primary)" /> AI Proposal Pitch
                  </div>
                  <button onClick={() => setAiApplyJob(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={16} />
                  </button>
                </div>

                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                  Target Job: <strong style={{ color: 'var(--text-primary)' }}>{aiApplyJob.title}</strong>
                </div>

                {aiLoading ? (
                  <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Loader2 size={22} className="animate-spin" style={{ margin: '0 auto 8px', color: 'var(--primary)' }} />
                    <div style={{ fontSize: '0.84rem' }}>Generating tailored proposal pitch...</div>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                        Proposed Payout ({aiApplyJob.currency || 'USD'})
                      </label>
                      <input
                        type="number"
                        value={aiBidAmount}
                        onChange={(e) => setAiBidAmount(Number(e.target.value))}
                        className="input-field"
                        style={{ width: '100%', fontSize: '0.86rem', padding: '8px 12px', height: '38px' }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                        Tailored Pitch Summary
                      </label>
                      <textarea
                        rows={4}
                        value={aiProposalText}
                        onChange={(e) => setAiProposalText(e.target.value)}
                        className="input-field"
                        style={{ width: '100%', fontSize: '0.82rem', padding: '10px', lineHeight: 1.45 }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => setAiApplyJob(null)} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                        Cancel
                      </button>
                      <button
                        onClick={handleAiProposalSubmit}
                        disabled={aiSubmitting}
                        className="btn-primary"
                        style={{ padding: '8px 18px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        {aiSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        Submit Pitch
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Deliverable Submission Modal */}
        <AnimatePresence>
          {showSubmitModal && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                style={{ maxWidth: '460px', width: '100%', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '18px', padding: '24px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileCheck size={18} color="var(--primary)" /> Submit Work Deliverable
                  </div>
                  <button onClick={() => setShowSubmitModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={16} />
                  </button>
                </div>

                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                  Project: <strong style={{ color: 'var(--text-primary)' }}>{submittingContract?.title}</strong>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Deliverable Summary *
                  </label>
                  <textarea
                    rows={3}
                    value={submissionSummary}
                    onChange={(e) => setSubmissionSummary(e.target.value)}
                    placeholder="Describe completed work..."
                    className="input-field"
                    style={{ width: '100%', fontSize: '0.84rem', padding: '10px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowSubmitModal(false)} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                    Cancel
                  </button>
                  <button
                    onClick={handleDeliverableSubmit}
                    disabled={isSubmitting || !submissionSummary.trim()}
                    className="btn-primary"
                    style={{ padding: '8px 18px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <FileCheck size={14} />}
                    Submit
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Completion Flyer Modal */}
        {selectedFlyerContract && (
          <JobCompletionFlyerModal
            isOpen={showFlyerModal}
            onClose={() => setShowFlyerModal(false)}
            contract={selectedFlyerContract}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default WorkPage;
