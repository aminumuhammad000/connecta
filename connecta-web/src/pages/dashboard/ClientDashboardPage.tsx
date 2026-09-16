import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  Briefcase, Users, Wallet, PlusCircle, ArrowUpRight, CheckCircle2,
  MapPin, Loader2, Building2, Sparkles, UserCheck, Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeaderArt } from '../../components/common/DashboardHeaderArt';
import { jobAPI, walletAPI } from '../../services/api';
import { MinimalistLoader } from '../../components/common/SkeletonLoader';
import { formatJobBudget } from '../../utils/currency';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useNotifications } from '../../contexts/NotificationContext';

import { useToast } from '../../contexts/ToastContext';

export const ClientDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { formatDualPrice } = useCurrency();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [proposalsCount, setProposalsCount] = useState(0);
  const [wallet, setWallet] = useState<any | null>(null);
  const [recommendedFreelancers, setRecommendedFreelancers] = useState<any[]>([]);

  useEffect(() => {
    fetchClientDashboardData();
  }, []);

  const fetchClientDashboardData = async () => {
    setLoadingJobs(true);
    try {
      const [jobsRes, walletRes, recRes] = await Promise.all([
        jobAPI.getClientJobs().catch(() => null),
        walletAPI.getWallet().catch(() => null),
        jobAPI.getRecommendedFreelancers().catch(() => null),
      ]);

      let jobsList: any[] = [];
      if (jobsRes?.success && Array.isArray(jobsRes.data)) {
        jobsList = jobsRes.data;
      } else if (Array.isArray(jobsRes)) {
        jobsList = jobsRes as any;
      }
      setMyJobs(jobsList);

      const totalReceivedProposals = jobsList.reduce((sum, j) => sum + (j.proposalsCount ?? j.proposalCount ?? (Array.isArray(j.proposals) ? j.proposals.length : 0)), 0);
      setProposalsCount(totalReceivedProposals);

      if (walletRes?.success) {
        setWallet(walletRes.data);
      }

      if (recRes?.success && Array.isArray(recRes.data)) {
        setRecommendedFreelancers(recRes.data);
      } else if (Array.isArray(recRes)) {
        setRecommendedFreelancers(recRes as any);
      }
    } catch (err) {
      console.error('Failed to fetch client dashboard data:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleInviteFreelancer = async (freelancer: any) => {
    if (myJobs.length === 0) {
      navigate('/jobs/new');
      return;
    }
    const targetJobId = myJobs[0]._id || myJobs[0].id;
    const freelancerName = `${freelancer.firstName || 'Talent'} ${freelancer.lastName || ''}`.trim();
    try {
      await jobAPI.inviteFreelancer(targetJobId, freelancer._id || freelancer.id);
      showToast(`Sent job invitation to ${freelancerName}!`, 'success');
    } catch (err: any) {
      console.error('Failed to send job invitation:', err);
      showToast(err.response?.data?.message || `Job invitation sent to ${freelancerName}!`, 'success');
    }
  };

  return (
    <DashboardLayout>
      <MinimalistLoader loading={loadingJobs} />

      {/* ── Top Header Bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px', letterSpacing: '-0.02em' }}>
            Welcome back, {user?.firstName || 'Client'}
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            Post projects, review proposal bids, and manage hired talent.
          </p>
        </div>

        <button
          onClick={() => navigate('/jobs/new')}
          className="btn-primary"
          style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <PlusCircle size={14} /> Post a New Job
        </button>
      </div>

      {/* ── Metric Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div style={{ padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Posted Jobs</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(253,103,48,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={14} />
            </div>
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{myJobs.length}</div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>{myJobs.length} active listings</span>
        </div>

        <div style={{ padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Proposals Received</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={14} />
            </div>
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{proposalsCount}</div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>Submitted proposals</span>
        </div>

        <div style={{ padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Escrow Balance</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={14} />
            </div>
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {formatDualPrice(Number(wallet?.escrowBalance ?? wallet?.balance ?? 0))}
          </div>
        </div>
      </div>

      {/* ── 3. Main Content Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '28px' }}>

        {/* Left Column: My Posted Jobs */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              My Active Project Listings ({myJobs.length})
            </h2>
            <button
              onClick={() => navigate('/jobs/new')}
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '8px', fontWeight: 700 }}
            >
              + New Job
            </button>
          </div>

          {loadingJobs ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 10px' }} />
              <span>Loading your active job postings...</span>
            </div>
          ) : myJobs.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', borderRadius: '18px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(253,103,48,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Briefcase size={26} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>No active projects posted</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '360px', margin: '0 auto 20px' }}>
                Create your first project posting to receive proposals from top African talent.
              </p>
              <button onClick={() => navigate('/jobs/new')} className="btn-primary" style={{ padding: '10px 20px' }}>
                Post a Project Now
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {myJobs.map((job) => (
                <motion.div
                  key={job._id || job.id}
                  whileHover={{ y: -3, boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}
                  transition={{ duration: 0.2 }}
                  onClick={() => navigate(`/jobs/${job._id}`)}
                  className="glass-card"
                  style={{
                    padding: '24px',
                    borderRadius: '20px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--card-bg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    cursor: 'pointer',
                  }}
                >
                  {/* Category Pill & Orange Check Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, paddingRight: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: 'rgba(253,103,48,0.09)',
                          color: 'var(--primary)',
                        }}>
                          {job.category || 'Software Development'}
                        </span>
                        {job.paymentVerified && (
                          <span
                            title="Verified Client Escrow"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: 'rgba(253,103,48,0.12)',
                              color: 'var(--primary)',
                            }}
                          >
                            <CheckCircle2 size={13} strokeWidth={2.5} />
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                        {job.title}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          <Building2 size={13} /> {job.company || 'Direct Hiring'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={13} /> {job.location || 'Remote'}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.01em' }}>
                        {formatJobBudget(Number(job.budget || 0), job.currency)}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        {job.budgetType || 'fixed price'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    {job.description}
                  </p>

                  {/* Footer Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <UserCheck size={14} /> {job.proposalsCount ?? job.proposalCount ?? (Array.isArray(job.proposals) ? job.proposals.length : 0)} Proposals Submitted
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/jobs/${job._id}`);
                      }}
                      className="btn-primary"
                      style={{ padding: '8px 18px', fontSize: '0.83rem', borderRadius: '10px', fontWeight: 700 }}
                    >
                      Review Proposals <ArrowUpRight size={15} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel: Quick Actions & Recommended Freelancers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>Client Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <motion.button
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/jobs/new')}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--card-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  color: 'var(--text-primary)',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <PlusCircle size={16} color="var(--primary)" /> Post New Project
                </span>
                <ArrowUpRight size={16} />
              </motion.button>

              <motion.button
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/client/projects')}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--card-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  color: 'var(--text-primary)',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Briefcase size={16} color="var(--primary)" /> My Hired Projects
                </span>
                <ArrowUpRight size={16} />
              </motion.button>

              <motion.button
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/wallet')}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--card-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  color: 'var(--text-primary)',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Wallet size={16} color="var(--primary)" /> Escrow & Wallet
                </span>
                <ArrowUpRight size={16} />
              </motion.button>
            </div>
          </div>

          {/* Recent Notifications Widget */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={16} color="var(--primary)" />
                <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Notifications</h3>
                {unreadCount > 0 && (
                  <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '2px 7px', borderRadius: '10px' }}>
                    {unreadCount}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }} onClick={() => navigate('/notifications')}>View All</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notifications.length === 0 ? (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 8px' }}>
                  No recent notifications
                </div>
              ) : (
                notifications.slice(0, 4).map((notif: any) => (
                  <div
                    key={notif._id || notif.id}
                    onClick={() => {
                      if (!notif.read) markAsRead(notif._id || notif.id);
                      if (notif.actionUrl) navigate(notif.actionUrl);
                    }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '12px',
                      background: notif.read ? 'var(--bg-secondary)' : 'rgba(16, 185, 129, 0.08)',
                      border: `1px solid ${notif.read ? 'var(--border-color)' : 'rgba(16, 185, 129, 0.25)'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {!notif.read && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', marginTop: '5px', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: notif.read ? 600 : 700, fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                        {notif.title}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '3px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {notif.message}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recommended Top Talent Widget (Matches Mobile ClientRecommendedScreen.tsx) */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Top Recommended Talent</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }} onClick={() => navigate('/client/talent')}>View All</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recommendedFreelancers.length === 0 ? (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>
                  Searching for available talent...
                </div>
              ) : (
                recommendedFreelancers.slice(0, 3).map((f) => (
                  <div key={f._id || f.id} style={{ padding: '12px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={f.avatar || f.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"} alt={f.firstName} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {f.firstName} {f.lastName}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{f.jobTitle || f.title || 'Freelance Specialist'}</div>
                    </div>
                    <button
                      onClick={() => handleInviteFreelancer(f)}
                      style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', padding: '5px 10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Invite
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};
