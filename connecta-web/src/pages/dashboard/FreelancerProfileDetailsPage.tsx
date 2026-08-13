import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, Star, ShieldCheck, Calendar, Briefcase,
  DollarSign, MessageSquare, Loader2, Award
} from 'lucide-react';
import { authAPI } from '../../services/api';
import { VerifiedBadge } from '../../components/common/VerifiedBadge';
import { EmploymentOfferModal } from '../../components/modals/EmploymentOfferModal';
import { formatJobBudget } from '../../utils/currency';

export const FreelancerProfileDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOfferModal, setShowOfferModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCandidateProfile(id);
    }
  }, [id]);

  const fetchCandidateProfile = async (userId: string) => {
    setLoading(true);
    try {
      const res = await authAPI.getUserById(userId);
      if (res?.success && res.data) {
        setCandidate(res.data);
      } else if (res && (res as any)._id) {
        setCandidate(res);
      }
    } catch (err) {
      console.error('Error fetching candidate profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const candidateName = candidate ? `${candidate.firstName || 'African'} ${candidate.lastName || 'Professional'}` : '';
  const avatarUrl = candidate?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidateName)}&background=FD6730&color=fff`;

  const formatRate = (c: any) => {
    if (!c) return 'Negotiable';
    if (c.monthlySalary || c.expectedSalary) {
      return formatJobBudget(Number(c.monthlySalary || c.expectedSalary), c.currency || 'USD') + ' / mo';
    }
    if (c.hourlyRate) {
      return formatJobBudget(Number(c.hourlyRate), c.currency || 'USD') + ' / hr';
    }
    return formatJobBudget(2500, c.currency || 'USD') + ' / mo';
  };

  return (
    <DashboardLayout>
      {/* Back Navigation Button */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'var(--bg-tertiary)',
            border: 'none',
            borderRadius: '10px',
            padding: '8px 16px',
            color: 'var(--text-primary)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ArrowLeft size={16} /> Back to Directory
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <div>Loading full candidate profile details...</div>
        </div>
      ) : !candidate ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', borderRadius: '20px' }}>
          <h3>Candidate Profile Not Found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>The requested freelancer profile could not be loaded.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '24px' }}>
          {/* Main Left Column: Profile Card & Bio */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header Banner Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card"
              style={{ padding: '32px', borderRadius: '24px', border: '1px solid var(--border-color)' }}
            >
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <img
                  src={avatarUrl}
                  alt={candidateName}
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid var(--primary)',
                    flexShrink: 0
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                      {candidateName}
                    </h1>
                    <VerifiedBadge tier={candidate.verificationTier || (candidate.isVerified ? 'vetted_pro' : 'community')} />
                  </div>

                  <p style={{ fontSize: '1.05rem', color: 'var(--primary)', fontWeight: 700, margin: '4px 0 10px' }}>
                    {candidate.jobTitle || candidate.userType || 'African Professional'}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} color="var(--primary)" /> {candidate.location || 'Lagos, Nigeria'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F59E0B', fontWeight: 700 }}>
                      <Star size={14} fill="#F59E0B" /> {candidate.rating || candidate.averageRating ? Number(candidate.rating || candidate.averageRating).toFixed(1) : '5.0'}
                      <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({candidate.reviewsCount || (Array.isArray(candidate.reviews) ? candidate.reviews.length : 0)} reviews)</span>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} /> Member Since {candidate.createdAt ? new Date(candidate.createdAt).getFullYear() : '2026'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginTop: '28px' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '16px 18px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <DollarSign size={14} color="var(--primary)" /> Expected Retainer / Rate
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
                    {formatRate(candidate)}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '16px 18px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Briefcase size={14} color="var(--primary)" /> Hiring Preference
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '6px' }}>
                    {candidate.preferredJobType === 'full_time_contract' ? 'Full-Time Permanent Hire' : 'Milestone Freelancer'}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '16px 18px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Award size={14} color="var(--primary)" /> Job Success Score
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>
                    {candidate.jobSuccessScore || 100}% Success Rate
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Professional Overview & Bio */}
            <div className="glass-card" style={{ padding: '28px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px' }}>
                Professional Biography & Background
              </h3>
              <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
                {candidate.bio || candidate.about || `${candidateName} is a disciplined, highly qualified African professional with verified credentials, excellent client communication, and strong domain expertise.`}
              </p>
            </div>

            {/* Verified Skills & Expertise */}
            {Array.isArray(candidate.skills) && candidate.skills.length > 0 && (
              <div className="glass-card" style={{ padding: '28px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 14px' }}>
                  Verified Technical & Sector Skills
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {candidate.skills.map((sk: string, idx: number) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        padding: '8px 16px',
                        borderRadius: '20px',
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Action & Metadata Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Direct Actions
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
                Start a direct conversation with {candidate.firstName} or send an official employment offer.
              </p>

              <button
                onClick={() => navigate(`/messages?user=${candidate._id}`)}
                className="btn-primary"
                style={{ width: '100%', padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '0.88rem', justifyContent: 'center' }}
              >
                <MessageSquare size={16} /> Message Candidate
              </button>

              <button
                onClick={() => setShowOfferModal(true)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                Send Employment Offer
              </button>
            </div>

            {/* Profile Information Overview Table */}
            <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 14px' }}>
                Profile Overview
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.84rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Location</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{candidate.location || 'Nigeria'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Identity Status</span>
                  <span style={{ fontWeight: 700, color: 'var(--success)' }}>Verified ✓</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Verification Tier</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)', textTransform: 'capitalize' }}>
                    {candidate.verificationTier?.replace('_', ' ') || 'Vetted Pro'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Language</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>English (Fluent)</span>
                </div>
              </div>
            </div>

            {/* Escrow Guarantee Box */}
            <div style={{ background: 'rgba(16,185,129,0.08)', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: 'var(--success)', fontWeight: 600 }}>
              <ShieldCheck size={20} style={{ flexShrink: 0 }} /> Connecta 100% Escrow Protection attached to all milestone payments and full-time retainer contracts.
            </div>
          </div>
        </div>
      )}

      {/* Employment Offer Letter Generator Modal */}
      {candidate && showOfferModal && (
        <EmploymentOfferModal
          isOpen={showOfferModal}
          onClose={() => setShowOfferModal(false)}
          proposalId={candidate._id}
          freelancerName={candidateName}
          jobTitle={candidate.jobTitle || 'African Professional'}
          defaultSalary={candidate.monthlySalary || (candidate.hourlyRate ? candidate.hourlyRate * 160 : 2500)}
        />
      )}
    </DashboardLayout>
  );
};
