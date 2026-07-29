import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, CheckCircle2, DollarSign, Briefcase, Calendar,
  ArrowUpRight, Heart, Loader2, Send, X, ShieldCheck
} from 'lucide-react';
import { jobAPI, proposalAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

export const JobDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  // Proposal modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [estimatedDays, setEstimatedDays] = useState<number>(14);
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJobDetails(id);
    }
  }, [id]);

  const fetchJobDetails = async (jobId: string) => {
    setLoading(true);
    try {
      const res = await jobAPI.getJobById(jobId);
      if (res.success && res.data) {
        setJob(res.data);
        setBidAmount(res.data.budget || 100000);
        setEstimatedDays(res.data.duration || 14);
      } else if (res && (res as any)._id) {
        setJob(res);
        setBidAmount((res as any).budget || 100000);
        setEstimatedDays((res as any).duration || 14);
      }
    } catch (err) {
      console.error('Failed to load job details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverLetter.trim()) {
      showToast('Please enter your cover letter / proposal pitch.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await proposalAPI.submitProposal({
        jobId: job._id || id,
        coverLetter,
        bidAmount: Number(bidAmount),
        estimatedDays: Number(estimatedDays),
      });
      showToast('Proposal submitted successfully!', 'success');
      setShowApplyModal(false);
      navigate('/proposals');
    } catch (err: any) {
      console.error('Error submitting proposal:', err);
      showToast(err.response?.data?.message || 'Failed to submit proposal.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Back Button */}
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
          <ArrowLeft size={16} /> Back to Jobs
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={28} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <span>Loading project details...</span>
        </div>
      ) : !job ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', borderRadius: '18px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>Project not found</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            The requested job posting may have been closed or removed.
          </p>
          <button onClick={() => navigate('/freelancer/dashboard')} className="btn-primary" style={{ padding: '10px 20px' }}>
            Explore Other Jobs
          </button>
        </div>
      ) : (
        <div className="grid-responsive-2" style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '28px' }}>

          {/* Left Main Details Column */}
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
              {/* Category Pill & Verified Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '4px 12px', borderRadius: '8px', background: 'rgba(253,103,48,0.09)', color: 'var(--primary)' }}>
                    {job.category || 'Software Development'}
                  </span>
                  {job.paymentVerified && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, background: 'rgba(253,103,48,0.08)', padding: '4px 12px', borderRadius: '20px' }}>
                      <CheckCircle2 size={13} strokeWidth={2.5} /> Verified Payment
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setIsSaved(!isSaved)}
                  style={{
                    background: isSaved ? 'rgba(239,68,68,0.1)' : 'var(--bg-tertiary)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: isSaved ? '#EF4444' : 'var(--text-muted)',
                  }}
                >
                  <Heart size={18} fill={isSaved ? '#EF4444' : 'none'} />
                </button>
              </div>

              {/* Title */}
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 16px', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
                {job.title}
              </h1>

              {/* Client Info Banner */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                background: 'var(--bg-secondary)',
                padding: '16px 20px',
                borderRadius: '16px',
                marginBottom: '24px',
                border: '1px solid var(--border-color)',
              }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'var(--grad-primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  flexShrink: 0,
                }}>
                  {(job.company || job.clientId?.firstName || 'C')[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {job.company || `${job.clientId?.firstName || 'Connecta'} ${job.clientId?.lastName || 'Client'}`}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {job.location || 'Remote'}</span>
                    <span>• Active Client</span>
                  </div>
                </div>
              </div>

              {/* Financial & Delivery Overview Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '28px' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '16px 18px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <DollarSign size={14} color="var(--primary)" /> Fixed Budget
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
                    ₦{Number(job.budget || 0).toLocaleString()}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '16px 18px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Briefcase size={14} color="var(--primary)" /> Job Type
                  </div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '6px', textTransform: 'capitalize' }}>
                    {job.budgetType || 'Fixed Price'}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '16px 18px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} color="var(--primary)" /> Delivery Time
                  </div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '6px' }}>
                    {job.duration || 14} days
                  </div>
                </div>
              </div>

              {/* Full Description */}
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '10px', color: 'var(--text-primary)' }}>
                  Project Description
                </h3>
                <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {job.description}
                </p>
              </div>

              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-primary)' }}>
                    Skills & Required Expertise
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {job.skills.map((skill: string, idx: number) => (
                      <span key={idx} style={{ fontSize: '0.82rem', fontWeight: 600, padding: '6px 14px', borderRadius: '20px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Action Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>Submit Proposal</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '20px' }}>
                Interested in this project? Submit your proposal directly to the client with your bid and delivery timeline.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowApplyModal(true)}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '0.92rem', fontWeight: 700, justifyContent: 'center' }}
              >
                Apply Now <ArrowUpRight size={18} />
              </motion.button>
            </div>
          </div>

        </div>
      )}

      {/* Proposal Submission Modal Overlay */}
      {showApplyModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 9999,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }} onClick={() => setShowApplyModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--card-bg)',
              borderRadius: '24px',
              padding: '32px',
              maxWidth: '600px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Submit Project Proposal
                </h2>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Job: {job?.title}
                </span>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                style={{ background: 'var(--bg-tertiary)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleProposalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Your Bid Amount (₦)</label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    className="input-field"
                    style={{ width: '100%' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Estimated Delivery (Days)</label>
                  <input
                    type="number"
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(Number(e.target.value))}
                    className="input-field"
                    style={{ width: '100%' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Cover Letter & Proposal Pitch</label>
                <textarea
                  rows={5}
                  placeholder="Explain why you are the best fit for this project, past relevant experience, and your proposed implementation approach..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', lineHeight: 1.5 }}
                  required
                />
              </div>

              <div style={{ background: 'rgba(16,185,129,0.08)', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>
                <ShieldCheck size={16} /> 100% Protected Escrow Payment upon Milestone Acceptance
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  style={{ padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                  style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: 700 }}
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Submit Proposal
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};
