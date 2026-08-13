import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, DollarSign, Briefcase, Calendar,
  ArrowUpRight, Heart, Loader2, Send, X, ShieldCheck, UserCheck, Star, MessageSquare
} from 'lucide-react';
import { jobAPI, proposalAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { formatJobBudget } from '../../utils/currency';
import { VerifiedBadge } from '../../components/common/VerifiedBadge';
import { EmploymentOfferModal } from '../../components/modals/EmploymentOfferModal';

export const JobDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isClient = user?.userType === 'client';

  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  // Client Received Proposals State
  const [proposals, setProposals] = useState<any[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [selectedProposalId, setSelectedProposalId] = useState<string>('');
  const [selectedCandidateName, setSelectedCandidateName] = useState<string>('');
  const [showOfferModal, setShowOfferModal] = useState(false);

  // Proposal modal state for Freelancers
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
      let loadedJob = null;
      if (res.success && res.data) {
        loadedJob = res.data;
      } else if (res && (res as any)._id) {
        loadedJob = res;
      }

      if (loadedJob) {
        setJob(loadedJob);
        setBidAmount(loadedJob.budget || 1000);
        setEstimatedDays(loadedJob.duration || 14);

        // Fetch proposals for this job if user is a client or owner
        fetchJobProposals(jobId);
      }
    } catch (err) {
      console.error('Failed to load job details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobProposals = async (jobId: string) => {
    setLoadingProposals(true);
    try {
      const res = await proposalAPI.getProposalsByJobId(jobId);
      if (res?.success && Array.isArray(res.data)) {
        setProposals(res.data);
      } else if (Array.isArray(res)) {
        setProposals(res);
      }
    } catch (err) {
      console.error('Error fetching job proposals:', err);
    } finally {
      setLoadingProposals(false);
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
        description: coverLetter,
        bidAmount: Number(bidAmount),
        price: Number(bidAmount),
        estimatedDays: Number(estimatedDays),
        deliveryTime: Number(estimatedDays),
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

  const handleAcceptProposal = async (proposalId: string) => {
    try {
      await proposalAPI.acceptProposal(proposalId);
      showToast('Proposal accepted! Employment contract agreement created.', 'success');
      fetchJobProposals(id || job._id);
    } catch (err: any) {
      console.error('Failed to accept proposal:', err);
      showToast(err.response?.data?.message || 'Failed to accept proposal.', 'error');
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
          <ArrowLeft size={16} /> Back to Listings
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <div>Loading listing details...</div>
        </div>
      ) : !job ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <h3>Job Listing Not Found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>The requested job listing may have been removed or closed.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isClient ? '1fr' : '2fr 1fr', gap: '24px' }}>
          {/* Main Job Details Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card"
              style={{ padding: '32px', borderRadius: '24px', border: '1px solid var(--border-color)' }}
            >
              {/* Category & Save Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '4px 12px', borderRadius: '8px', background: 'rgba(253,103,48,0.1)', color: 'var(--primary)', textTransform: 'uppercase' }}>
                  {job.category || 'Technology'}
                </span>

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
                    <span>• Active Verified Client</span>
                  </div>
                </div>
              </div>

              {/* Financial & Delivery Overview Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '28px' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '16px 18px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <DollarSign size={14} color="var(--primary)" /> Budget / Salary
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
                    {formatJobBudget(Number(job.budget || 0), job.currency)}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '16px 18px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Briefcase size={14} color="var(--primary)" /> Contract Model
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '6px', textTransform: 'capitalize' }}>
                    {job.jobType === 'full_time_contract' ? 'Full-Time Permanent' : job.jobType === 'collabo_squad' ? 'Collabo Squad' : 'Milestone Gig'}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '16px 18px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} color="var(--primary)" /> {job.jobType === 'full_time_contract' ? 'Start Window' : 'Timeframe'}
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '6px' }}>
                    {job.duration || 14} days
                  </div>
                </div>
              </div>

              {/* Full Description */}
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '10px', color: 'var(--text-primary)' }}>
                  Project Scope & Deliverables
                </h3>
                <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {job.description}
                </p>
              </div>

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <div style={{ marginBottom: '28px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '10px', color: 'var(--text-primary)' }}>
                    Key Job Requirements
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {job.requirements.map((req: string, idx: number) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-primary)' }}>
                    Required Sector Skills
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

            {/* ================= CLIENT PROPOSAL REVIEW SECTION ================= */}
            {isClient && (
              <div className="glass-card" style={{ padding: '32px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                      Submitted Candidate Proposals ({proposals.length})
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Review profiles, cover letters, proposed bids, and interview talent for this role.
                    </p>
                  </div>

                  <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '6px 14px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>
                    Live Applicants: {proposals.length}
                  </span>
                </div>

                {loadingProposals ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                    <div>Loading candidate proposals...</div>
                  </div>
                ) : proposals.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '16px', color: 'var(--text-muted)' }}>
                    <UserCheck size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                    <h4 style={{ margin: '0 0 6px', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700 }}>No Proposals Submitted Yet</h4>
                    <p style={{ margin: 0, fontSize: '0.86rem' }}>
                      Candidate proposals will appear here automatically as talent applies to your listing.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {proposals.map((p) => {
                      const candidate = p.freelancerId || {};
                      const candidateName = `${candidate.firstName || 'Talent'} ${candidate.lastName || 'Professional'}`;

                      return (
                        <motion.div
                          key={p._id}
                          whileHover={{ y: -2 }}
                          style={{
                            background: 'var(--bg-secondary)',
                            borderRadius: '18px',
                            padding: '24px',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                          }}
                        >
                          {/* Candidate Header Profile */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                            <div
                              onClick={() => navigate(`/talent/${candidate._id || p.freelancerId}`)}
                              style={{ display: 'flex', gap: '14px', alignItems: 'center', cursor: 'pointer' }}
                              title="Click to view full freelancer profile details"
                            >
                              <img
                                src={candidate.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidateName)}&background=FD6730&color=fff`}
                                alt={candidateName}
                                style={{ width: '54px', height: '54px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                              />
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, textDecoration: 'underline decoration-dotted' }}>
                                    {candidateName}
                                  </h4>
                                  <VerifiedBadge tier={candidate.verificationTier || (candidate.isVerified ? 'vetted_pro' : 'community')} />
                                </div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '2px' }}>
                                  {candidate.jobTitle || candidate.userType || 'African Tech Professional'} • {candidate.location || 'Lagos, Nigeria'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#F59E0B', fontWeight: 700 }}>
                                    <Star size={12} fill="#F59E0B" /> {candidate.rating || candidate.averageRating ? Number(candidate.rating || candidate.averageRating).toFixed(1) : '5.0'}
                                  </span>
                                  <span>• {candidate.jobSuccessScore || 100}% Success Score</span>
                                </div>
                              </div>
                            </div>

                            {/* Candidate Proposed Bid */}
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>
                                {formatJobBudget(p.bidAmount || p.proposedRate || 0, job.currency)}
                              </div>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                                Timeframe: {p.estimatedDays || 14} Days
                              </span>
                            </div>
                          </div>

                          {/* Proposal Cover Letter */}
                          <div style={{ background: 'var(--card-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <h5 style={{ margin: '0 0 6px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                              Candidate Cover Letter & Pitch
                            </h5>
                            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.55 }}>
                              {p.coverLetter || p.description}
                            </p>
                          </div>

                          {/* Candidate Skill Chips */}
                          {Array.isArray(candidate.skills) && candidate.skills.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {candidate.skills.map((sk: string) => (
                                <span key={sk} style={{ fontSize: '0.74rem', padding: '4px 10px', borderRadius: '12px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                  {sk}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>

                            <button
                              onClick={() => navigate(`/messages?user=${candidate._id || p.freelancerId}`)}
                              style={{
                                padding: '9px 16px',
                                borderRadius: '10px',
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-tertiary)',
                                color: 'var(--text-primary)',
                                fontWeight: 700,
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <MessageSquare size={14} /> Message
                            </button>

                            <button
                              onClick={() => {
                                setSelectedProposalId(p._id);
                                setSelectedCandidateName(candidateName);
                                if (p.status !== 'accepted') {
                                  handleAcceptProposal(p._id);
                                }
                                setShowOfferModal(true);
                              }}
                              className="btn-primary"
                              style={{ padding: '9px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '0.82rem' }}
                            >
                              {p.status === 'accepted' ? 'Send Official Offer' : 'Hire Candidate'}
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Panel for Freelancers */}
          {!isClient && (
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
          )}

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
                  Submit Your Proposal
                </h2>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  {job?.title}
                </p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleProposalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Your Bid Amount ({job?.currency || 'USD'})</label>
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
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Estimated Timeframe (Days)</label>
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
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Cover Letter & Work Approach</label>
                <textarea
                  rows={5}
                  placeholder="Explain why you are the best fit for this project, past relevant experience, and key deliverables..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', lineHeight: 1.5 }}
                  required
                />
              </div>

              <div style={{ background: 'rgba(16,185,129,0.08)', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: 'var(--success)', fontWeight: 600 }}>
                <ShieldCheck size={16} /> 100% Escrow Protection attached to all milestone releases.
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
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

      {/* Employment Offer Letter Generator Modal */}
      {showOfferModal && (
        <EmploymentOfferModal
          isOpen={showOfferModal}
          onClose={() => setShowOfferModal(false)}
          proposalId={selectedProposalId || ''}
          freelancerName={selectedCandidateName || 'Candidate'}
          jobTitle={job?.title || 'Job Listing'}
          defaultSalary={job?.budget || 2500}
        />
      )}
    </DashboardLayout>
  );
};
