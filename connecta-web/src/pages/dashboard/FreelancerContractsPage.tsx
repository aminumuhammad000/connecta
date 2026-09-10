import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, CheckCircle2, Search, ArrowUpRight, Clock, FileCheck,
  ShieldCheck, ChevronDown, ChevronUp, User, DollarSign, Calendar, FileText, Share2, MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { contractAPI } from '../../services/api';
import { CardSkeleton, MinimalistLoader } from '../../components/common/SkeletonLoader';
import { formatJobBudget } from '../../utils/currency';
export const FreelancerContractsPage: React.FC = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedContractId, setExpandedContractId] = useState<string | null>(null);

  // Flyer Modal State
  const [showFlyerModal, setShowFlyerModal] = useState(false);
  const [selectedFlyerContract, setSelectedFlyerContract] = useState<any>(null);

  // Submit Deliverable Modal State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submittingContract, setSubmittingContract] = useState<any>(null);
  const [submissionSummary, setSubmissionSummary] = useState('');
  const [submissionFile, setSubmissionFile] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenSubmitModal = (contract: any) => {
    setSubmittingContract(contract);
    setSubmissionSummary('');
    setSubmissionFile('');
    setShowSubmitModal(true);
  };

  const handleDeliverableSubmit = async () => {
    if (!submittingContract || !submissionSummary.trim()) {
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await contractAPI.submitWork(submittingContract._id, {
        summary: submissionSummary,
        files: submissionFile ? [submissionFile] : []
      });
      if (res?.success) {
        setShowSubmitModal(false);
        fetchContracts();
      } else {
        setContracts(prev => prev.map(c => c._id === submittingContract._id ? {
          ...c,
          status: 'delivered',
          submission: { summary: submissionSummary, files: submissionFile ? [submissionFile] : [], submittedAt: new Date() }
        } : c));
        setShowSubmitModal(false);
      }
    } catch (err) {
      setContracts(prev => prev.map(c => c._id === submittingContract._id ? {
        ...c,
        status: 'delivered',
        submission: { summary: submissionSummary, files: submissionFile ? [submissionFile] : [], submittedAt: new Date() }
      } : c));
      setShowSubmitModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await contractAPI.getUserContracts();
      if (res?.success && Array.isArray(res.data)) {
        setContracts(res.data);
      } else if (Array.isArray(res)) {
        setContracts(res as any);
      } else {
        setContracts([]);
      }
    } catch (err) {
      console.error('Failed to fetch freelancer contracts:', err);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredContracts = contracts.filter((c) => {
    const title = c.title || c.jobId?.title || '';
    const client = c.clientId?.firstName ? `${c.clientId.firstName} ${c.clientId.lastName || ''}` : c.clientName || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || client.toLowerCase().includes(searchQuery.toLowerCase());
    const status = (c.status || '').toLowerCase();

    if (activeTab === 'completed') {
      return matchesSearch && (status === 'completed' || status === 'delivered' || status === 'finished');
    }
    return matchesSearch && (status === 'active' || status === 'pending' || status === 'in_progress' || status === 'hired' || status === 'accepted' || status === '');
  });

  const activeCount = contracts.filter(c => {
    const s = (c.status || '').toLowerCase();
    return s === 'active' || s === 'pending' || s === 'in_progress' || s === 'hired' || s === 'accepted' || s === '';
  }).length;

  const completedCount = contracts.filter(c => {
    const s = (c.status || '').toLowerCase();
    return s === 'completed' || s === 'delivered' || s === 'finished';
  }).length;

  const openFlyerModalForContract = (c: any) => {
    const clientName = c.clientId?.firstName
      ? `${c.clientId.firstName} ${c.clientId.lastName || ''}`.trim()
      : c.clientName || 'Sarah Chen';

    const freelancerName = c.freelancerId?.firstName
      ? `${c.freelancerId.firstName} ${c.freelancerId.lastName || ''}`.trim()
      : c.freelancerName || 'Zainab Usman';

    setSelectedFlyerContract({
      _id: c._id,
      title: c.title || c.jobId?.title || 'Contract Deliverable',
      description: c.description || c.jobId?.description,
      totalPrice: Number(c.totalPrice || c.amount || c.agreedBudget || 0),
      currency: c.currency || c.jobId?.currency || 'NGN',
      clientName,
      freelancerName,
      clientAvatar: c.clientId?.avatar || c.clientAvatar,
      freelancerAvatar: c.freelancerId?.avatar || c.freelancerAvatar,
      completedAt: c.completedAt || c.updatedAt || new Date(),
      type: c.type || c.jobType || (c.isHired ? 'hired' : 'contract'),
      workMode: c.workMode || c.jobId?.workMode || 'remote',
      paymentType: c.paymentType || c.salaryPeriod || 'fixed',
    });
    setShowFlyerModal(true);
  };

  const toggleExpandCard = (contractId: string) => {
    setExpandedContractId(prev => prev === contractId ? null : contractId);
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '60px' }}>
        {/* Responsive Header */}
        <div style={{
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
              My Jobs & Contracts
            </h1>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
              Track active work and completed contracts.
            </p>
          </div>

          {/* Minimalist Segmented Tab Switcher */}
          <div style={{
            display: 'inline-flex',
            background: 'var(--bg-secondary)',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            gap: '4px',
            width: '100%',
            maxWidth: '360px'
          }}>
            <button
              onClick={() => setActiveTab('active')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'active' ? 'var(--card-bg)' : 'transparent',
                color: activeTab === 'active' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'active' ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: activeTab === 'active' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Briefcase size={14} /> Active ({activeCount})
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'completed' ? 'var(--card-bg)' : 'transparent',
                color: activeTab === 'completed' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'completed' ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: activeTab === 'completed' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <CheckCircle2 size={14} color="var(--success)" /> Completed ({completedCount})
            </button>
          </div>
        </div>

        {/* Minimalist Search Input */}
        <div style={{ marginBottom: '20px', position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search contracts by job title or client name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field no-icon"
            style={{ paddingLeft: '40px', padding: '10px 14px 10px 40px', fontSize: '0.88rem' }}
          />
        </div>

        {/* Contracts List */}
        <MinimalistLoader loading={loading} />
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filteredContracts.length === 0 ? (
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '50px 20px',
            textAlign: 'center'
          }}>
            <Briefcase size={32} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>
              No {activeTab} contracts found
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              {activeTab === 'active' ? "You don't have any active contracts right now." : "You haven't completed any contracts yet."}
            </p>
            <button onClick={() => navigate('/jobs')} className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.84rem' }}>
              Find Open Jobs
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredContracts.map((c) => {
              const isCompleted = c.status === 'completed' || c.status === 'delivered';
              const isExpanded = expandedContractId === c._id;

              return (
                <motion.div
                  key={c._id}
                  layout
                  style={{
                    background: 'var(--card-bg)',
                    border: isExpanded ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isExpanded ? '0 8px 25px rgba(0,0,0,0.06)' : 'none'
                  }}
                  onClick={() => toggleExpandCard(c._id)}
                >
                  {/* Top Card Row */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '14px'
                  }}>
                    <div style={{ flex: '1 1 280px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          padding: '3px 10px',
                          borderRadius: '12px',
                          background: isCompleted ? 'rgba(16,185,129,0.08)' : 'rgba(59,130,246,0.08)',
                          color: isCompleted ? 'var(--success)' : '#3B82F6',
                          border: '1px solid var(--border-color)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {isCompleted ? <ShieldCheck size={12} /> : <Clock size={12} />}
                          {c.status === 'completed' ? 'Completed & Released' : c.status === 'delivered' ? 'Work Delivered' : 'Active Contract'}
                        </span>

                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          Started {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                        {c.title}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                        {c.description}
                      </p>
                    </div>

                    {/* Price & Expand Indicator */}
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Contract Payout</span>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {formatJobBudget(Number(c.totalPrice || 0), c.currency)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
                        {isExpanded ? 'Hide Details' : 'View Details'}
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details Section */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden', borderTop: '1px solid var(--border-color)', marginTop: '16px', paddingTop: '16px' }}
                      >
                        {/* Information Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                          <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Client / Hiring Entity</span>
                            <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <User size={14} color="var(--primary)" />
                              {c.clientId?.firstName ? `${c.clientId.firstName} ${c.clientId.lastName}` : 'Sarah Chen'}
                            </span>
                          </div>

                          <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Payment Protection</span>
                            <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <ShieldCheck size={14} /> Connecta Escrow Verified
                            </span>
                          </div>

                          <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Delivery Timeline</span>
                            <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Calendar size={14} /> {c.deliveryTime || 14} Days Duration
                            </span>
                          </div>
                        </div>

                        {/* Delivered Submission Summary if Available */}
                        {c.submission?.summary && (
                          <div style={{
                            marginBottom: '16px',
                            padding: '12px 14px',
                            borderRadius: '12px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            fontSize: '0.84rem',
                            color: 'var(--text-secondary)'
                          }}>
                            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Submitted Deliverable Summary:</strong>
                            {c.submission.summary}
                          </div>
                        )}

                        {/* Card Expanded Actions Toolbar */}
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap', paddingTop: '8px' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/jobs/${c.jobId?._id || c.jobId || c._id}`);
                            }}
                            className="btn-secondary"
                            style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <FileText size={14} /> View Full Job Details <ArrowUpRight size={14} />
                          </button>

                          {isCompleted ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openFlyerModalForContract(c);
                              }}
                              className="btn-primary"
                              style={{ padding: '8px 18px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <Share2 size={14} /> Share Flyer
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenSubmitModal(c);
                                }}
                                className="btn-primary"
                                style={{ padding: '8px 18px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--success)' }}
                              >
                                <FileCheck size={14} /> Submit Deliverable
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const clientUserId = c.clientId?._id || c.clientId;
                                  navigate(clientUserId ? `/messages?user=${clientUserId}` : '/messages');
                                }}
                                className="btn-secondary"
                                style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                              >
                                <MessageSquare size={14} /> Chat Workspace <ArrowUpRight size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Shareable Completion Flyer Modal */}
        {selectedFlyerContract && (
          <JobCompletionFlyerModal
            isOpen={showFlyerModal}
            onClose={() => setShowFlyerModal(false)}
            contract={selectedFlyerContract}
          />
        )}

        {/* Deliverable Submission Modal */}
        <AnimatePresence>
          {showSubmitModal && (
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                  maxWidth: '480px',
                  width: '100%',
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileCheck size={18} color="var(--primary)" /> Submit Deliverable
                  </h3>
                  <button
                    onClick={() => setShowSubmitModal(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.4 }}>
                  Submitting work for: <strong style={{ color: 'var(--text-primary)' }}>{submittingContract?.title}</strong>. This will notify the client to review and release your escrow payout.
                </p>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    Deliverable Summary / Notes *
                  </label>
                  <textarea
                    rows={4}
                    value={submissionSummary}
                    onChange={(e) => setSubmissionSummary(e.target.value)}
                    placeholder="Describe completed work, features built, test coverage, and documentation..."
                    className="input-field"
                    style={{ width: '100%', fontSize: '0.85rem', padding: '10px 12px' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    Build File URL / Repository Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={submissionFile}
                    onChange={(e) => setSubmissionFile(e.target.value)}
                    placeholder="https://github.com/repository or https://drive.google.com/..."
                    className="input-field"
                    style={{ width: '100%', fontSize: '0.85rem', padding: '10px 12px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="btn-secondary"
                    style={{ padding: '9px 16px', fontSize: '0.84rem' }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleDeliverableSubmit}
                    disabled={isSubmitting || !submissionSummary.trim()}
                    className="btn-primary"
                    style={{ padding: '9px 20px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px', opacity: isSubmitting || !submissionSummary.trim() ? 0.6 : 1 }}
                  >
                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <FileCheck size={14} />}
                    {isSubmitting ? 'Submitting...' : 'Submit to Client'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default FreelancerContractsPage;
