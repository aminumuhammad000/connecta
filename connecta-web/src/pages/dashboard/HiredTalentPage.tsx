import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import {
  MapPin, MessageSquare, Loader2, Search, Star, UserCheck, Briefcase,
  X, ShieldCheck, DollarSign, ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authAPI, projectAPI } from '../../services/api';
import { VerifiedBadge } from '../../components/common/VerifiedBadge';
import { EmploymentOfferModal } from '../../components/modals/EmploymentOfferModal';
import { formatJobBudget } from '../../utils/currency';

export const HiredTalentPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'hired'>('all');
  const [allTalent, setAllTalent] = useState<any[]>([]);
  const [hiredTalent, setHiredTalent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals state
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<any | null>(null);
  const [selectedTalentForOffer, setSelectedTalentForOffer] = useState<any | null>(null);

  useEffect(() => {
    fetchTalentData();
  }, []);

  const fetchTalentData = async () => {
    setLoading(true);
    try {
      // 1. Fetch All Registered African Freelancers from database
      const freelancersRes = await authAPI.getFreelancers({ limit: 100 });
      const freelancersData = freelancersRes?.data || (Array.isArray(freelancersRes) ? freelancersRes : []);
      setAllTalent(freelancersData);

      // 2. Fetch Hired Team from active client contracts
      const projectsRes = await projectAPI.getClientProjects();
      const projectsData = Array.isArray(projectsRes) ? projectsRes : projectsRes?.data || [];
      const parsedHired = projectsData
        .filter((p: any) => p.freelancerId)
        .map((p: any) => {
          const fl = p.freelancerId;
          return {
            _id: fl._id || p._id,
            firstName: fl.firstName || 'Talent',
            lastName: fl.lastName || 'Professional',
            jobTitle: fl.jobTitle || fl.title || 'Contract Professional',
            rating: fl.rating || fl.averageRating || 4.9,
            reviewsCount: fl.reviewsCount || 12,
            location: fl.location || 'Lagos, Nigeria',
            hiredFor: p.title || 'Active Project Contract',
            profileImage: fl.profileImage,
            status: p.status || 'Active Contract',
            isVerified: fl.isVerified,
            verificationTier: fl.verificationTier || 'vetted_pro',
            skills: fl.skills || [],
            hourlyRate: fl.hourlyRate,
            monthlySalary: fl.monthlySalary,
            bio: fl.bio,
            preferredJobType: fl.preferredJobType || 'full_time_contract',
          };
        });
      setHiredTalent(parsedHired);
    } catch (err) {
      console.error('Failed to fetch talent data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format dynamic rate display based on user database fields
  const formatCandidateRate = (t: any) => {
    if (t.monthlySalary || t.expectedSalary) {
      return formatJobBudget(Number(t.monthlySalary || t.expectedSalary), t.currency || 'USD') + ' / mo';
    }
    if (t.hourlyRate) {
      return formatJobBudget(Number(t.hourlyRate), t.currency || 'USD') + ' / hr';
    }
    if (t.preferredJobType === 'full_time_contract') {
      return formatJobBudget(2500, t.currency || 'USD') + ' / mo';
    }
    return 'Negotiable Rate';
  };

  // Filtered talent logic
  const currentList = activeTab === 'all' ? allTalent : hiredTalent;
  const filteredTalent = currentList.filter((t) => {
    const fullName = `${t.firstName || ''} ${t.lastName || ''}`.toLowerCase();
    const title = (t.jobTitle || t.title || '').toLowerCase();
    const skillsStr = Array.isArray(t.skills) ? t.skills.join(' ').toLowerCase() : '';
    const query = searchQuery.toLowerCase();

    const matchesSearch = !query || fullName.includes(query) || title.includes(query) || skillsStr.includes(query);

    const jobType = t.preferredJobType || t.jobType || '';
    if (selectedCategory === 'full_time') {
      return matchesSearch && (jobType === 'full_time_contract' || title.includes('permanent') || title.includes('full-time') || title.includes('gateman') || title.includes('guard'));
    }
    if (selectedCategory === 'milestone_gig') {
      return matchesSearch && (jobType === 'milestone_gig' || title.includes('freelance') || title.includes('gig'));
    }
    if (selectedCategory === 'security_trades') {
      return matchesSearch && (title.includes('security') || title.includes('gate') || title.includes('driver') || title.includes('artisan') || title.includes('facility') || skillsStr.includes('gate') || skillsStr.includes('security'));
    }
    if (selectedCategory === 'tech') {
      return matchesSearch && (title.includes('developer') || title.includes('engineer') || title.includes('tech') || title.includes('web') || title.includes('mobile'));
    }
    if (selectedCategory === 'design') {
      return matchesSearch && (title.includes('design') || title.includes('ui') || title.includes('brand') || title.includes('creative'));
    }

    return matchesSearch;
  });

  return (
    <DashboardLayout>
      {/* Header Banner */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            African Talent & Hire Portal
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
            Discover vetted African professionals, gatemen, security specialists, engineers, and manage your hired team.
          </p>
        </div>

        {/* Tab Switcher Buttons */}
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setActiveTab('all')}
            style={{
              padding: '8px 18px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'all' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'all' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            All Talent Directory ({allTalent.length})
          </button>
          <button
            onClick={() => setActiveTab('hired')}
            style={{
              padding: '8px 18px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'hired' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'hired' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            My Hired Team ({hiredTalent.length})
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-card" style={{ padding: '16px 20px', borderRadius: '18px', marginBottom: '24px', border: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by name, role (e.g. Gateman, Developer, Designer) or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ width: '100%', paddingLeft: '42px', fontSize: '0.9rem', borderRadius: '12px' }}
          />
        </div>

        {/* Quick Category & Employment Type Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Roles' },
            { id: 'full_time', label: 'Full-Time Permanent Seekers' },
            { id: 'milestone_gig', label: 'Milestone Freelancers' },
            { id: 'security_trades', label: 'Security & Trades' },
            { id: 'tech', label: 'Tech & Engineering' },
            { id: 'design', label: 'Design & Creative' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: '1px solid var(--border-color)',
                background: selectedCategory === cat.id ? 'rgba(253,103,48,0.12)' : 'var(--bg-secondary)',
                color: selectedCategory === cat.id ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={28} className="animate-spin" style={{ margin: '0 auto 10px' }} />
          <div>Loading African talent profiles from database...</div>
        </div>
      ) : filteredTalent.length === 0 ? (
        <div className="glass-card" style={{ padding: '50px 20px', textAlign: 'center', borderRadius: '20px', color: 'var(--text-muted)' }}>
          <UserCheck size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <h3 style={{ color: 'var(--text-primary)', margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 800 }}>No Talent Found</h3>
          <p style={{ margin: 0, fontSize: '0.88rem' }}>
            No registered professionals match your search criteria. Try adjusting your query or sector filter.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredTalent.map((t) => {
            const fullName = `${t.firstName || 'Talent'} ${t.lastName || 'Professional'}`;
            const avatarUrl = t.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=FD6730&color=fff`;
            const candidateRateText = formatCandidateRate(t);

            return (
              <motion.div
                key={t._id}
                whileHover={{ y: -4 }}
                onClick={() => setSelectedCandidateDetail(t)}
                className="glass-card"
                style={{
                  padding: '24px',
                  borderRadius: '20px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--card-bg)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div>
                  {/* Top Profile Card Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '12px' }}>
                    <img
                      src={avatarUrl}
                      alt={fullName}
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid var(--primary)',
                        flexShrink: 0
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {fullName}
                        </span>
                        <VerifiedBadge tier={t.verificationTier || (t.isVerified ? 'vetted_pro' : 'community')} size="sm" />
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, display: 'block', marginTop: '2px' }}>
                        {t.jobTitle || t.title || 'African Professional'}
                      </span>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <MapPin size={12} /> {t.location || 'Lagos, Nigeria'}
                      </span>
                    </div>
                  </div>

                  {/* Rating & Dynamic Real Rate Metrics */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '12px', marginBottom: '14px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 700, color: '#F59E0B' }}>
                      <Star size={14} fill="#F59E0B" /> {t.rating || t.averageRating || '4.9'}
                      <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.74rem' }}>
                        ({t.reviewsCount || 15} reviews)
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {candidateRateText}
                    </div>
                  </div>

                  {/* Skills Tags */}
                  {Array.isArray(t.skills) && t.skills.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                      {t.skills.slice(0, 4).map((sk: string) => (
                        <span key={sk} style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '12px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          {sk}
                        </span>
                      ))}
                      {t.skills.length > 4 && (
                        <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '12px', background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                          +{t.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Active Hired Project Banner */}
                  {t.hiredFor && (
                    <div style={{ fontSize: '0.78rem', background: 'rgba(16,185,129,0.08)', color: 'var(--success)', padding: '8px 12px', borderRadius: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Briefcase size={13} /> Active Contract: {t.hiredFor}
                    </div>
                  )}
                </div>

                {/* Footer Action Buttons */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', justifyContent: 'flex-end' }}
                >

                  <button
                    onClick={() => navigate(`/messages?user=${t._id}`)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '10px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <MessageSquare size={13} /> Message
                  </button>

                  <button
                    onClick={() => setSelectedTalentForOffer(t)}
                    className="btn-primary"
                    style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700 }}
                  >
                    Hire / Offer
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ================= FULL CANDIDATE PROFILE DETAILS MODAL ================= */}
      {selectedCandidateDetail && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 9999,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }} onClick={() => setSelectedCandidateDetail(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--card-bg)',
              borderRadius: '24px',
              padding: '32px',
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <img
                  src={selectedCandidateDetail.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCandidateDetail.firstName + ' ' + selectedCandidateDetail.lastName)}&background=FD6730&color=fff`}
                  alt={selectedCandidateDetail.firstName}
                  style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      {selectedCandidateDetail.firstName} {selectedCandidateDetail.lastName}
                    </h2>
                    <VerifiedBadge tier={selectedCandidateDetail.verificationTier || (selectedCandidateDetail.isVerified ? 'vetted_pro' : 'community')} />
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--primary)', fontWeight: 700, marginTop: '2px' }}>
                    {selectedCandidateDetail.jobTitle || 'African Professional'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><MapPin size={12} /> {selectedCandidateDetail.location || 'Lagos, Nigeria'}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#F59E0B', fontWeight: 700 }}><Star size={12} fill="#F59E0B" /> {selectedCandidateDetail.rating || '4.9'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedCandidateDetail(null)}
                style={{ background: 'var(--bg-tertiary)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Employment Status & Rate Banner */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '14px 16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Briefcase size={14} color="var(--primary)" /> Hiring Availability
                </span>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {selectedCandidateDetail.preferredJobType === 'full_time_contract' ? 'Full-Time Permanent Hire' : 'Milestone Freelancer'}
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '14px 16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <DollarSign size={14} color="var(--primary)" /> Expected Retainer / Rate
                </span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
                  {formatCandidateRate(selectedCandidateDetail)}
                </div>
              </div>
            </div>

            {/* Bio / About */}
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>Professional Biography & Overview</h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, background: 'var(--bg-secondary)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                {selectedCandidateDetail.bio || selectedCandidateDetail.about || `${selectedCandidateDetail.firstName} is a highly qualified African professional with verified credentials, excellent customer track record, and strong work ethic.`}
              </p>
            </div>

            {/* Skills */}
            {Array.isArray(selectedCandidateDetail.skills) && selectedCandidateDetail.skills.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>Verified Expertise & Skills</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedCandidateDetail.skills.map((sk: string) => (
                    <span key={sk} style={{ fontSize: '0.8rem', padding: '6px 12px', borderRadius: '16px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontWeight: 600, border: '1px solid var(--border-color)' }}>
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Trust & Guarantee */}
            <div style={{ background: 'rgba(16,185,129,0.08)', padding: '12px 16px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: 'var(--success)', fontWeight: 600 }}>
              <ShieldCheck size={18} /> Connecta Escrow Protection & Permanent Contract Guarantee attached to all hires.
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>

              <button
                onClick={() => {
                  setSelectedCandidateDetail(null);
                  navigate(`/messages?user=${selectedCandidateDetail._id}`);
                }}
                style={{
                  padding: '11px 18px',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <MessageSquare size={15} /> Message
              </button>

              <button
                onClick={() => {
                  const c = selectedCandidateDetail;
                  setSelectedCandidateDetail(null);
                  setSelectedTalentForOffer(c);
                }}
                className="btn-primary"
                style={{ padding: '11px 22px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                Hire / Send Offer <ArrowUpRight size={16} />
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Full Time Employment Offer Letter Modal */}
      {selectedTalentForOffer && (
        <EmploymentOfferModal
          isOpen={!!selectedTalentForOffer}
          onClose={() => setSelectedTalentForOffer(null)}
          proposalId={selectedTalentForOffer._id}
          freelancerName={`${selectedTalentForOffer.firstName || ''} ${selectedTalentForOffer.lastName || ''}`}
          jobTitle={selectedTalentForOffer.jobTitle || 'African Professional'}
          defaultSalary={selectedTalentForOffer.monthlySalary || (selectedTalentForOffer.hourlyRate ? selectedTalentForOffer.hourlyRate * 160 : 2500)}
        />
      )}
    </DashboardLayout>
  );
};
