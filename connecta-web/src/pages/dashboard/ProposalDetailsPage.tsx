import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2, DollarSign, Calendar, MapPin,
  ShieldCheck, Loader2, UserCheck, Star, MessageSquare, Briefcase, FileText, Bot,
  Edit3, RotateCcw, AlertCircle, X
} from 'lucide-react';
import { proposalAPI, aiInterviewAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { formatJobBudget } from '../../utils/currency';

export const ProposalDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isClient = user?.userType === 'client';

  const [proposal, setProposal] = useState<any | null>(null);
  const [interviewData, setInterviewData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Edit Proposal Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBidAmount, setEditBidAmount] = useState<number | string>(0);
  const [editDeliveryTime, setEditDeliveryTime] = useState<number | string>(14);
  const [editCoverLetter, setEditCoverLetter] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Withdraw Proposal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProposal();
    }
  }, [id]);

  const fetchProposal = async (proposalId?: string) => {
    const targetId = proposalId || id;
    if (!targetId) return;
    setLoading(true);
    try {
      const res = await proposalAPI.getProposalById(targetId);
      let propObj = null;
      if (res?.success && res.data) {
        propObj = res.data;
      } else {
        const myRes = await proposalAPI.getMyProposals();
        const list = Array.isArray(myRes) ? myRes : myRes?.data || [];
        propObj = list.find((p: any) => p._id === targetId);
      }

      if (propObj) {
        setProposal(propObj);
        setEditBidAmount(propObj.price || propObj.bidAmount || 0);
        setEditDeliveryTime(propObj.deliveryTime || propObj.estimatedDays || 14);
        setEditCoverLetter(propObj.description || propObj.coverLetter || '');

        // Fetch AI Interview data if required or existing
        if (propObj.jobId?.requireAiInterview || propObj.aiInterviewStatus !== 'not_required') {
          aiInterviewAPI.getByProposalId(targetId)
            .then((ivRes) => {
              if (ivRes?.success && ivRes.data) {
                setInterviewData(ivRes.data);
              }
            })
            .catch(() => null);
        }
      }
    } catch (err) {
      console.error('Failed to load proposal details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleHireAndFundEscrow = async () => {
    if (!id) return;
    setProcessing(true);
    try {
      await proposalAPI.acceptProposal(id);
      setProposal((prev: any) => ({ ...prev, status: 'accepted' }));
      showToast('Proposal accepted & milestone project created in Escrow!', 'success');
      navigate('/client/projects');
    } catch (err: any) {
      console.error('Failed to accept proposal:', err);
      showToast(err.response?.data?.message || 'Failed to accept proposal.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeclineProposal = async () => {
    if (!id) return;
    setProcessing(true);
    try {
      await proposalAPI.rejectProposal(id);
      setProposal((prev: any) => ({ ...prev, status: 'rejected' }));
      showToast('Proposal declined.', 'info');
    } catch (err: any) {
      console.error('Failed to decline proposal:', err);
      showToast(err.response?.data?.message || 'Failed to decline proposal.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveEditProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const numericBid = Number(editBidAmount);
    if (isNaN(numericBid) || numericBid <= 0) {
      showToast('Please enter a valid bid amount greater than zero.', 'error');
      return;
    }
    const numericDays = Number(editDeliveryTime);
    if (isNaN(numericDays) || numericDays < 1) {
      showToast('Please enter a valid estimated delivery duration (at least 1 day).', 'error');
      return;
    }
    if (!editCoverLetter.trim()) {
      showToast('Please provide a pitch or cover letter describing your solution.', 'error');
      return;
    }

    setSavingEdit(true);
    try {
      const res = await proposalAPI.updateProposal(id, {
        bidAmount: numericBid,
        price: numericBid,
        estimatedDays: numericDays,
        deliveryTime: numericDays,
        coverLetter: editCoverLetter.trim(),
        description: editCoverLetter.trim(),
      });

      if (res?.success) {
        setProposal((prev: any) => ({
          ...prev,
          price: numericBid,
          bidAmount: numericBid,
          deliveryTime: numericDays,
          estimatedDays: numericDays,
          description: editCoverLetter.trim(),
          coverLetter: editCoverLetter.trim(),
        }));
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
    if (!id) return;
    setWithdrawing(true);
    try {
      const res = await proposalAPI.withdrawProposal(id);
      if (res?.success) {
        setProposal((prev: any) => ({ ...prev, status: 'withdrawn' }));
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

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'var(--bg-tertiary)',
            border: 'none',
            borderRadius: '10px',
            padding: '8px 14px',
            color: 'var(--text-primary)',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
          }}
        >
          <ArrowLeft size={16} /> Back to Proposals
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={28} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <span>Loading proposal details...</span>
        </div>
      ) : !proposal ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', borderRadius: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>Proposal Not Found</h3>
          <button onClick={() => navigate('/proposals')} className="btn-primary" style={{ padding: '10px 20px' }}>
            Return to Proposals
          </button>
        </div>
      ) : (
        <div className="grid-responsive-2" style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '28px' }}>
          {/* Main Proposal Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card"
              style={{
                padding: '32px',
                borderRadius: '24px',
                border: '1px solid var(--border-color)',
                background: 'var(--card-bg)',
              }}
            >
              {/* Proposal Status Pill */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '4px 12px', borderRadius: '10px', background: 'rgba(253,103,48,0.1)', color: 'var(--primary)', textTransform: 'uppercase' }}>
                  {isClient ? 'Client Review • Proposal Pitch' : 'Submitted Proposal Details'}
                </span>

                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  padding: '4px 14px',
                  borderRadius: '12px',
                  background: proposal.status === 'accepted' ? 'rgba(16,185,129,0.1)' : proposal.status === 'rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(253,103,48,0.1)',
                  color: proposal.status === 'accepted' ? 'var(--success)' : proposal.status === 'rejected' ? '#EF4444' : 'var(--primary)',
                  textTransform: 'capitalize',
                }}>
                  Status: {proposal.status || 'Under Review'}
                </span>
              </div>

              {/* Job Title */}
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 20px', lineHeight: 1.3 }}>
                {proposal.jobId?.title || proposal.jobTitle || 'Project Proposal'}
              </h1>

              {/* Profile Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                background: 'var(--bg-secondary)',
                padding: '18px 20px',
                borderRadius: '18px',
                marginBottom: '28px',
                border: '1px solid var(--border-color)',
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--grad-primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  border: '2px solid var(--primary)',
                }}>
                  {(proposal.freelancerName || proposal.freelancerId?.firstName || 'F')[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      {proposal.freelancerName || (proposal.freelancerId?.firstName ? `${proposal.freelancerId.firstName} ${proposal.freelancerId.lastName}` : 'Zainab Usman')}
                    </span>
                    <CheckCircle2 size={16} color="var(--primary)" strokeWidth={2.5} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 700 }}>
                      {proposal.freelancerTitle || proposal.freelancerId?.title || 'Verified Talent'}
                    </span>
                    {(proposal.freelancerId?.cv || proposal.freelancerId?.resume || proposal.cv || proposal.resume) && (
                      <a
                        href={proposal.freelancerId?.cv || proposal.freelancerId?.resume || proposal.cv || proposal.resume}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          padding: '5px 11px',
                          borderRadius: '8px',
                          background: 'rgba(253, 103, 48, 0.08)',
                          color: 'var(--primary)',
                          border: '1px solid rgba(253, 103, 48, 0.2)',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          textDecoration: 'none'
                        }}
                      >
                        <FileText size={13} /> View CV
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Financial & Delivery Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '18px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <DollarSign size={14} color="var(--primary)" /> Proposed Bid Amount
                  </span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginTop: '6px' }}>
                    {formatJobBudget(Number(proposal.bidAmount || proposal.proposedRate || 0), proposal.jobId?.currency || proposal.currency)}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '18px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} color="var(--primary)" /> Estimated Delivery
                  </span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px' }}>
                    {proposal.estimatedDays || 14} days
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '10px', color: 'var(--text-primary)' }}>
                  Cover Letter & Proposal Pitch
                </h3>
                <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>
                  {proposal.coverLetter || proposal.description}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Action Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* AI Interview Status & Result Card */}
            <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bot size={20} color="var(--primary)" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    AI Interview {proposal.aiInterviewStatus === 'completed' ? 'Results' : 'Portal'}
                  </h3>
                </div>
                {proposal.aiInterviewStatus === 'completed' && (
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, padding: '3px 10px', borderRadius: '8px', background: 'rgba(16,185,129,0.12)', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={12} /> Completed
                  </span>
                )}
              </div>

              {!isClient ? (
                proposal.aiInterviewStatus === 'completed' ? (
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                    You have successfully completed the AI interview for this position. Your responses have been submitted to the client for evaluation.
                  </p>
                ) : (
                  <div>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.45 }}>
                      {proposal.jobId?.requireAiInterview
                        ? 'This client requires applicants to complete an AI interview for this position.'
                        : 'Complete an AI-powered technical interview to boost your proposal ranking.'}
                    </p>
                    <button
                      onClick={() => navigate(`/interview/${proposal._id}`)}
                      className="btn-primary"
                      style={{ width: '100%', padding: '12px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <Bot size={16} /> Take AI Interview
                    </button>
                  </div>
                )
              ) : (
                interviewData?.result ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
                      <div style={{ background: 'var(--bg-secondary)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Score</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>{interviewData.result.score}/100</div>
                      </div>
                      <div style={{ background: 'var(--bg-secondary)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tech Fit</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--success)' }}>{interviewData.result.technicalFit}%</div>
                      </div>
                      <div style={{ background: 'var(--bg-secondary)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Comm.</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{interviewData.result.communicationScore}%</div>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                      {interviewData.result.summary}
                    </p>

                    {/* Hiring Client Full Interview Transcript Drawer */}
                    {interviewData.answers?.length > 0 && (
                      <details style={{ marginTop: '6px', cursor: 'pointer' }}>
                        <summary style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', outline: 'none' }}>
                          View Spoken Q&A Transcript ({interviewData.answers.length} Responses)
                        </summary>
                        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto' }}>
                          {interviewData.answers.map((ans: any, idx: number) => (
                            <div key={idx} style={{ background: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.78rem' }}>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                                Q{idx + 1}: {ans.question}
                              </div>
                              <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.4 }}>
                                "{ans.answerText}"
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {proposal.aiInterviewStatus === 'completed' ? 'Interview recorded and verified.' : 'Candidate has not completed the AI interview for this proposal yet.'}
                  </p>
                )
              )}
            </div>

            <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-primary)' }}>
                {isClient ? 'Client Decision' : 'Proposal Status'}
              </h3>

              {isClient ? (
                proposal.status === 'accepted' ? (
                  <div style={{ background: 'rgba(16,185,129,0.1)', padding: '14px', borderRadius: '12px', color: 'var(--success)', fontWeight: 700, fontSize: '0.88rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <CheckCircle2 size={18} /> Proposal Accepted & Hired
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleHireAndFundEscrow}
                      disabled={processing}
                      className="btn-primary"
                      style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, justifyContent: 'center' }}
                    >
                      {processing ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />} Hire & Fund Escrow
                    </motion.button>

                    <button
                      onClick={() => navigate('/messages')}
                      style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.86rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <MessageSquare size={16} /> Message Freelancer
                    </button>

                    <button
                      onClick={handleDeclineProposal}
                      style={{ background: 'none', border: 'none', color: '#EF4444', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', textAlign: 'center', marginTop: '4px' }}
                    >
                      Decline Proposal
                    </button>
                  </div>
                )
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '4px' }}>
                    {proposal.status === 'accepted'
                      ? '🎉 The client accepted your proposal! Funds are held in Escrow.'
                      : proposal.status === 'rejected'
                      ? 'The client declined this proposal.'
                      : proposal.status === 'withdrawn'
                      ? 'You have withdrawn your proposal for this role.'
                      : 'Your proposal is currently pending review by the client.'}
                  </div>

                  {/* Pending Freelancer Actions: Edit & Withdraw */}
                  {proposal.status === 'pending' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                      <button
                        onClick={() => {
                          setEditBidAmount(proposal.price || proposal.bidAmount || 0);
                          setEditDeliveryTime(proposal.deliveryTime || proposal.estimatedDays || 14);
                          setEditCoverLetter(proposal.description || proposal.coverLetter || '');
                          setShowEditModal(true);
                        }}
                        className="btn-primary"
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <Edit3 size={15} /> Edit Proposal
                      </button>

                      <button
                        onClick={() => setShowWithdrawModal(true)}
                        style={{
                          width: '100%',
                          padding: '11px',
                          borderRadius: '12px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-secondary)',
                          color: '#EF4444',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <RotateCcw size={15} /> Withdraw Proposal
                      </button>
                    </div>
                  )}

                  {proposal.status === 'withdrawn' && (
                    <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
                      <RotateCcw size={14} /> Proposal Withdrawn
                    </div>
                  )}

                  <button
                    onClick={() => navigate(`/jobs/${proposal.jobId?._id || proposal.jobId}`)}
                    style={{ width: '100%', padding: '11px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '0.86rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
                  >
                    <Briefcase size={15} /> View Job Listing
                  </button>

                  <button
                    onClick={() => {
                      const clientUserId = proposal.jobId?.clientId?._id || proposal.jobId?.clientId || proposal.clientId;
                      navigate(clientUserId ? `/messages?user=${clientUserId}` : '/messages');
                    }}
                    style={{ width: '100%', padding: '11px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.86rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <MessageSquare size={15} /> Chat Workspace
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Proposal Modal */}
      {showEditModal && (
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
                  Edit Proposal
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
                    Proposed Bid Rate ({proposal.jobId?.currency || 'USD'})
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
      {showWithdrawModal && (
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
              Are you sure you want to withdraw your proposal for <strong>"{proposal.jobId?.title || 'this job'}"</strong>? The client will no longer review or consider your application.
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

export default ProposalDetailsPage;
