import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle2, XCircle, ArrowUpRight, Search, Bot, Edit3, RotateCcw, AlertCircle, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { proposalAPI } from '../../services/api';
import { CardSkeleton, MinimalistLoader } from '../../components/common/SkeletonLoader';
import { formatJobBudget } from '../../utils/currency';
import { useToast } from '../../contexts/ToastContext';

export const MyProposalsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected' | 'withdrawn'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Action Modals State
  const [selectedProposal, setSelectedProposal] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [editBidAmount, setEditBidAmount] = useState<number | string>(0);
  const [editDeliveryTime, setEditDeliveryTime] = useState<number | string>(14);
  const [editCoverLetter, setEditCoverLetter] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const res = await proposalAPI.getMyProposals();
      const list = Array.isArray(res) ? res : res?.data || [];
      setProposals(list);
    } catch (err) {
      console.error('Failed to load proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  const openEditProposalModal = (e: React.MouseEvent, prop: any) => {
    e.stopPropagation();
    setSelectedProposal(prop);
    setEditBidAmount(prop.price || prop.bidAmount || 0);
    setEditDeliveryTime(prop.deliveryTime || prop.estimatedDays || 14);
    setEditCoverLetter(prop.description || prop.coverLetter || '');
    setShowEditModal(true);
  };

  const openWithdrawProposalModal = (e: React.MouseEvent, prop: any) => {
    e.stopPropagation();
    setSelectedProposal(prop);
    setShowWithdrawModal(true);
  };

  const handleSaveEditProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProposal?._id) return;
    const numericBid = Number(editBidAmount);
    if (isNaN(numericBid) || numericBid <= 0) {
      showToast('Please enter a valid bid amount greater than zero.', 'error');
      return;
    }
    const numericDays = Number(editDeliveryTime);
    if (isNaN(numericDays) || numericDays < 1) {
      showToast('Please enter a valid delivery timeline (at least 1 day).', 'error');
      return;
    }
    if (!editCoverLetter.trim()) {
      showToast('Please provide a pitch or cover letter describing your solution.', 'error');
      return;
    }

    setSavingEdit(true);
    try {
      const res = await proposalAPI.updateProposal(selectedProposal._id, {
        bidAmount: numericBid,
        price: numericBid,
        estimatedDays: numericDays,
        deliveryTime: numericDays,
        coverLetter: editCoverLetter.trim(),
        description: editCoverLetter.trim(),
      });

      if (res?.success) {
        setProposals((prev) =>
          prev.map((p) =>
            p._id === selectedProposal._id
              ? {
                  ...p,
                  price: numericBid,
                  bidAmount: numericBid,
                  deliveryTime: numericDays,
                  estimatedDays: numericDays,
                  description: editCoverLetter.trim(),
                  coverLetter: editCoverLetter.trim(),
                }
              : p
          )
        );
        showToast('Proposal updated successfully!', 'success');
        setShowEditModal(false);
      }
    } catch (err: any) {
      console.error('Update proposal error:', err);
      showToast(err?.response?.data?.message || 'Failed to update proposal', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmWithdraw = async () => {
    if (!selectedProposal?._id) return;
    setWithdrawing(true);
    try {
      const res = await proposalAPI.withdrawProposal(selectedProposal._id);
      if (res?.success) {
        setProposals((prev) =>
          prev.map((p) => (p._id === selectedProposal._id ? { ...p, status: 'withdrawn' } : p))
        );
        showToast('Proposal withdrawn successfully.', 'info');
        setShowWithdrawModal(false);
      }
    } catch (err: any) {
      console.error('Withdraw proposal error:', err);
      showToast(err?.response?.data?.message || 'Failed to withdraw proposal', 'error');
    } finally {
      setWithdrawing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return (
          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={12} /> Accepted
          </span>
        );
      case 'rejected':
      case 'declined':
        return (
          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', color: '#EF4444', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <XCircle size={12} /> Declined
          </span>
        );
      case 'withdrawn':
        return (
          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <RotateCcw size={12} /> Withdrawn
          </span>
        );
      default:
        return (
          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(253,103,48,0.1)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} /> Under Review
          </span>
        );
    }
  };

  const filteredProposals = proposals.filter((p) => {
    const title = (p.jobId?.title || p.jobTitle || 'Proposal').toLowerCase();
    const matchesSearch = title.includes(searchQuery.toLowerCase());
    const status = (p.status || 'pending').toLowerCase();

    if (activeFilter === 'pending') return matchesSearch && (status === 'pending' || status === 'under_review' || status === '');
    if (activeFilter === 'accepted') return matchesSearch && status === 'accepted';
    if (activeFilter === 'rejected') return matchesSearch && (status === 'rejected' || status === 'declined');
    if (activeFilter === 'withdrawn') return matchesSearch && status === 'withdrawn';
    return matchesSearch;
  });

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '880px', margin: '0 auto', paddingBottom: '100px' }}>
        
        {/* Minimalist Top Header & Tab Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px', letterSpacing: '-0.02em' }}>
              Submitted Proposals
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
              Track active bids, edit pitches, or withdraw applications.
            </p>
          </div>

          {/* Desktop Segmented Filter Pills */}
          <div className="desktop-proposals-tabs" style={{ display: 'inline-flex', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)', gap: '4px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `All (${proposals.length})` },
              { id: 'pending', label: 'In Review' },
              { id: 'accepted', label: 'Accepted' },
              { id: 'rejected', label: 'Declined' },
              { id: 'withdrawn', label: 'Withdrawn' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9px',
                  border: 'none',
                  background: activeFilter === tab.id ? 'var(--card-bg)' : 'transparent',
                  color: activeFilter === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: activeFilter === tab.id ? 700 : 500,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  boxShadow: activeFilter === tab.id ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Fixed Bottom Floating Tab Switcher */}
        <div className="mobile-proposals-tabs-bar">
          {[
            { id: 'all', label: `All (${proposals.length})` },
            { id: 'pending', label: 'In Review' },
            { id: 'accepted', label: 'Accepted' },
            { id: 'rejected', label: 'Declined' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={activeFilter === tab.id ? 'active-filter-tab' : ''}
              style={{
                border: 'none',
                background: activeFilter === tab.id ? 'var(--primary)' : 'transparent',
                color: activeFilter === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: activeFilter === tab.id ? 800 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search proposals by job title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '40px', width: '100%', borderRadius: '12px', fontSize: '0.86rem', height: '42px', background: 'var(--card-bg)' }}
          />
        </div>

        {/* Proposals List */}
        <MinimalistLoader loading={loading} />
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filteredProposals.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <FileText size={28} color="var(--primary)" style={{ margin: '0 auto 10px', opacity: 0.8 }} />
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>No proposals found</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              You haven't submitted proposals under this filter yet.
            </p>
            <button onClick={() => navigate('/jobs')} className="btn-primary" style={{ padding: '7px 16px', fontSize: '0.8rem' }}>
              Explore Open Jobs
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredProposals.map((item) => {
              const jobId = item.jobId?._id || item.jobId || item._id;
              const jobTitle = item.jobId?.title || item.jobTitle || 'Project Proposal';
              const currency = item.jobId?.currency || item.currency || 'USD';

              return (
                <motion.div
                  key={item._id}
                  whileHover={{ y: -2, borderColor: 'var(--primary)' }}
                  onClick={() => navigate(`/proposals/${item._id}`)}
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
                  {/* Top Bar: Status Badge & Proposed Rate */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {getStatusBadge(item.status)}
                      {(item.jobId?.requireAiInterview || (item.aiInterviewStatus && item.aiInterviewStatus !== 'not_required')) && (
                        item.aiInterviewStatus === 'completed' ? (
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(16,185,129,0.12)', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={12} /> AI Interview Completed
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/interview/${item._id}`);
                            }}
                            className="btn-primary"
                            style={{ padding: '3px 10px', fontSize: '0.72rem', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Bot size={12} /> Take AI Interview
                          </button>
                        )
                      )}
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        Submitted {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <div style={{
                      padding: '4px 12px',
                      borderRadius: '10px',
                      background: 'rgba(253,103,48,0.08)',
                      border: '1px solid rgba(253,103,48,0.2)',
                      color: 'var(--primary)',
                      fontWeight: 800,
                      fontSize: '1.05rem',
                      letterSpacing: '-0.01em'
                    }}>
                      {formatJobBudget(Number(item.bidAmount || item.proposedRate || 0), currency)}
                    </div>
                  </div>

                  {/* Middle Title & Pitch Preview */}
                  <div>
                    <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.02em', lineHeight: 1.35 }}>
                      {jobTitle}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.coverLetter || item.description}
                    </p>
                  </div>

                  {/* Bottom Toolbar */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', pt: '8px', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
                    {item.status === 'pending' && (
                      <>
                        <button
                          onClick={(e) => openEditProposalModal(e, item)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            background: 'rgba(253,103,48,0.1)',
                            color: 'var(--primary)',
                            border: '1px solid rgba(253,103,48,0.25)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Edit3 size={12} /> Edit Proposal
                        </button>
                        <button
                          onClick={(e) => openWithdrawProposalModal(e, item)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            background: 'var(--bg-secondary)',
                            color: '#EF4444',
                            border: '1px solid var(--border-color)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <RotateCcw size={12} /> Withdraw
                        </button>
                      </>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/proposals/${item._id}`);
                      }}
                      style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                    >
                      Inspect Pitch
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/jobs/${jobId}`);
                      }}
                      className="btn-primary"
                      style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      View Job <ArrowUpRight size={13} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Proposal Modal */}
      {showEditModal && selectedProposal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div
            onClick={() => !savingEdit && setShowEditModal(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '540px',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid var(--border-color)',
              background: 'var(--card-bg)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
              zIndex: 410,
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1.08rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Edit Proposal Pitch
                </h3>
              </div>
              <button
                type="button"
                onClick={() => !savingEdit && setShowEditModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditProposal}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Proposed Bid Rate ({selectedProposal.jobId?.currency || 'USD'})
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editBidAmount}
                    onChange={(e) => setEditBidAmount(e.target.value)}
                    required
                    className="input-field no-icon"
                    style={{ padding: '10px 14px', fontSize: '0.9rem', width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Est. Delivery (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editDeliveryTime}
                    onChange={(e) => setEditDeliveryTime(e.target.value)}
                    required
                    className="input-field no-icon"
                    style={{ padding: '10px 14px', fontSize: '0.9rem', width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Cover Letter / Solution Pitch
                </label>
                <textarea
                  rows={6}
                  value={editCoverLetter}
                  onChange={(e) => setEditCoverLetter(e.target.value)}
                  required
                  placeholder="Explain why you are the best fit for this project..."
                  className="input-field no-icon"
                  style={{ padding: '12px 14px', fontSize: '0.88rem', width: '100%', resize: 'vertical', minHeight: '120px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  disabled={savingEdit}
                  onClick={() => setShowEditModal(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '10px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.84rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="btn-primary"
                  style={{ padding: '9px 20px', borderRadius: '10px', fontSize: '0.84rem', fontWeight: 700 }}
                >
                  {savingEdit ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Save Updates
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Withdraw Proposal Confirmation Modal */}
      {showWithdrawModal && selectedProposal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div
            onClick={() => !withdrawing && setShowWithdrawModal(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '440px',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid var(--border-color)',
              background: 'var(--card-bg)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
              zIndex: 410,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
                <AlertCircle size={18} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Withdraw Proposal?
              </h3>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              Are you sure you want to withdraw your proposal for <strong>"{selectedProposal.jobId?.title || selectedProposal.jobTitle || 'this role'}"</strong>? The client will no longer review or consider your application.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                disabled={withdrawing}
                onClick={() => setShowWithdrawModal(false)}
                style={{
                  padding: '9px 16px',
                  borderRadius: '10px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}
              >
                Keep Proposal
              </button>
              <button
                type="button"
                disabled={withdrawing}
                onClick={handleConfirmWithdraw}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  background: '#EF4444',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {withdrawing ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />} Confirm Withdraw
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyProposalsPage;
