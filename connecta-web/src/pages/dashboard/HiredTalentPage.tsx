import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Star, MapPin, CheckCircle2, MessageSquare, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { projectAPI } from '../../services/api';

export const HiredTalentPage: React.FC = () => {
  const navigate = useNavigate();
  const [talentList, setTalentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHiredTalent();
  }, []);

  const fetchHiredTalent = async () => {
    setLoading(true);
    try {
      const res = await projectAPI.getClientProjects();
      const projects = Array.isArray(res) ? res : res?.data || [];
      
      const parsedTalent = projects
        .filter((p: any) => p.freelancerId)
        .map((p: any) => {
          const fl = p.freelancerId;
          return {
            id: p._id,
            name: `${fl.firstName || 'Usman'} ${fl.lastName || 'Umar'}`,
            title: fl.title || 'Senior Full-Stack Engineer',
            rating: fl.rating || 4.9,
            reviews: fl.reviewsCount || 28,
            location: fl.location || 'Lagos, Nigeria',
            hiredFor: p.title || 'Mobile Payment Escrow & Chat Integration',
            avatar: fl.profileImage,
            status: p.status || 'Active Contract',
          };
        });

      setTalentList(parsedTalent);
    } catch (err) {
      console.error('Failed to fetch hired talent:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          Hired Freelancer Talent
        </h1>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
          Manage your contract team members, review ongoing milestones, and message hired professionals.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={26} className="animate-spin" style={{ margin: '0 auto 10px' }} />
          <span>Loading hired talent list...</span>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {talentList.map((t) => (
            <motion.div
              key={t.id}
              whileHover={{ y: -3 }}
              className="glass-card"
              style={{
                padding: '24px',
                borderRadius: '20px',
                border: '1px solid var(--border-color)',
                background: 'var(--card-bg)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: 'var(--grad-primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  border: '2px solid var(--primary)',
                }}>
                  {t.name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)' }}>{t.name}</span>
                    <CheckCircle2 size={14} color="var(--primary)" strokeWidth={2.5} />
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, display: 'block' }}>{t.title}</span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <MapPin size={11} /> {t.location}
                  </span>
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Project: </span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{t.hiredFor}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F59E0B', fontWeight: 700, fontSize: '0.82rem' }}>
                  <Star size={14} fill="#F59E0B" /> {t.rating} <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({t.reviews} reviews)</span>
                </div>
                <button
                  onClick={() => navigate('/messages')}
                  className="btn-primary"
                  style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <MessageSquare size={14} /> Message
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};
