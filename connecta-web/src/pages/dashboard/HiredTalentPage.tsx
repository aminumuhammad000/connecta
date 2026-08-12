import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { MapPin, MessageSquare, Loader2, Search, Star, UserCheck, Video, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authAPI, projectAPI } from '../../services/api';
import { VerifiedBadge } from '../../components/common/VerifiedBadge';
import { EmploymentOfferModal } from '../../components/modals/EmploymentOfferModal';
import { ScreeningCallModal } from '../../components/modals/ScreeningCallModal';

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
  const [selectedTalentForOffer, setSelectedTalentForOffer] = useState<any | null>(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callParticipant, setCallParticipant] = useState<{ name: string; role?: string }>({ name: '' });

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
            hourlyRate: fl.hourlyRate || 25,
          };
        });
      setHiredTalent(parsedHired);
    } catch (err) {
      console.error('Failed to fetch talent data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered talent based on tab, search query, and category
  const currentList = activeTab === 'all' ? allTalent : hiredTalent;
  const filteredTalent = currentList.filter((t) => {
    const fullName = `${t.firstName || ''} ${t.lastName || ''}`.toLowerCase();
    const title = (t.jobTitle || t.title || '').toLowerCase();
    const skillsStr = Array.isArray(t.skills) ? t.skills.join(' ').toLowerCase() : '';
    const query = searchQuery.toLowerCase();

    const matchesSearch = !query || fullName.includes(query) || title.includes(query) || skillsStr.includes(query);

    if (selectedCategory === 'security_trades') {
      return matchesSearch && (title.includes('security') || title.includes('gate') || title.includes('driver') || title.includes('artisan') || title.includes('facility') || skillsStr.includes('gate'));
    } else if (selectedCategory === 'tech') {
      return matchesSearch && (title.includes('developer') || title.includes('engineer') || title.includes('tech') || title.includes('web') || title.includes('mobile'));
    } else if (selectedCategory === 'design') {
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

        {/* Quick Category Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Roles' },
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

            return (
              <motion.div
                key={t._id}
                whileHover={{ y: -3 }}
                className="glass-card"
                style={{
                  padding: '24px',
                  borderRadius: '20px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--card-bg)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  justifyContent: 'space-between'
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

                  {/* Rating & Rate Metrics */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '12px', marginBottom: '14px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 700, color: '#F59E0B' }}>
                      <Star size={14} fill="#F59E0B" /> {t.rating || t.averageRating || '4.9'}
                      <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.74rem' }}>
                        ({t.reviewsCount || 15} reviews)
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      ${t.hourlyRate || 25} / hr
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
                <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', justifyContent: 'space-between' }}>
                  <button
                    onClick={() => {
                      setCallParticipant({ name: fullName, role: t.jobTitle });
                      setShowCallModal(true);
                    }}
                    style={{
                      padding: '8px 12px',
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
                    <Video size={13} color="var(--primary)" /> Call
                  </button>

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

      {/* Full Time Employment Offer Letter Modal */}
      {selectedTalentForOffer && (
        <EmploymentOfferModal
          isOpen={!!selectedTalentForOffer}
          onClose={() => setSelectedTalentForOffer(null)}
          proposalId={selectedTalentForOffer._id}
          freelancerName={`${selectedTalentForOffer.firstName || ''} ${selectedTalentForOffer.lastName || ''}`}
          jobTitle={selectedTalentForOffer.jobTitle || 'African Professional'}
          defaultSalary={selectedTalentForOffer.hourlyRate ? selectedTalentForOffer.hourlyRate * 160 : 2500}
        />
      )}

      {/* Screening Video Call Modal */}
      {showCallModal && (
        <ScreeningCallModal
          isOpen={showCallModal}
          onClose={() => setShowCallModal(false)}
          participantName={callParticipant.name}
          participantRole={callParticipant.role}
        />
      )}
    </DashboardLayout>
  );
};
