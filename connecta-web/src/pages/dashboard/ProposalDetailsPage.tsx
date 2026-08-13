import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2, DollarSign, Calendar, MapPin,
  ShieldCheck, Loader2, UserCheck, Star, MessageSquare
} from 'lucide-react';
import { proposalAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { formatJobBudget } from '../../utils/currency';

export const ProposalDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [proposal, setProposal] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

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
      if (res?.success && res.data) {
        setProposal(res.data);
      } else {
        // Try fallback search from list if single endpoint response structure varies
        const myRes = await proposalAPI.getMyProposals();
        const list = Array.isArray(myRes) ? myRes : myRes?.data || [];
        const found = list.find((p: any) => p._id === targetId);
        if (found) setProposal(found);
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
                  Client Review • Proposal Details
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
                {proposal.jobTitle || 'Senior Full-Stack Developer'}
              </h1>

              {/* Freelancer Profile Badge */}
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
                  {(proposal.freelancerName || 'F')[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      {proposal.freelancerName || 'Usman Umar'}
                    </span>
                    <CheckCircle2 size={16} color="var(--primary)" strokeWidth={2.5} />
                  </div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 700, display: 'block', marginTop: '2px' }}>
                    {proposal.freelancerTitle || 'Senior Software Engineer'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#F59E0B', fontWeight: 700 }}>
                      <Star size={12} fill="#F59E0B" /> {proposal.rating || 4.9} ({proposal.reviews || 28} reviews)
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <MapPin size={12} /> {proposal.freelancerLocation || 'Abuja, Nigeria'}
                    </span>
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
                    {formatJobBudget(Number(proposal.bidAmount || proposal.proposedRate || 0), proposal.jobId?.currency)}
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

              {/* Skills */}
              {proposal.skills && proposal.skills.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-primary)' }}>
                    Freelancer Skills & Expertise
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {proposal.skills.map((skill: string, idx: number) => (
                      <span key={idx} style={{ fontSize: '0.82rem', fontWeight: 600, padding: '6px 14px', borderRadius: '20px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Hiring Action Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-primary)' }}>Client Decision</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '20px' }}>
                Accepting this proposal will create the project contract and hold funds securely in Paystack Escrow until milestone completion.
              </p>

              {proposal.status === 'accepted' ? (
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
              )}
            </div>

            <div style={{ background: 'rgba(16,185,129,0.08)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--success)', fontSize: '0.82rem', lineHeight: 1.45, fontWeight: 600, display: 'flex', gap: '10px' }}>
              <ShieldCheck size={20} style={{ flexShrink: 0 }} />
              <div>
                100% Protected Escrow Payments. Funds are only released upon your explicit milestone approval.
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
