import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  Briefcase, Wallet, Star, ArrowUpRight, Search, CheckCircle2, TrendingUp,
  Clock, MapPin, Loader2, Heart, Building2, Sparkles, X, DollarSign, Calendar, ChevronRight, User, MessageSquare,
  UploadCloud, FileText, AlertCircle, GraduationCap, Bell, Bookmark
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeaderArt } from '../../components/common/DashboardHeaderArt';
import { jobAPI, proposalAPI, walletAPI, savedJobAPI, contractAPI, authAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { MinimalistLoader } from '../../components/common/SkeletonLoader';
import { formatJobBudget } from '../../utils/currency';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { JobCompletionFlyerModal } from '../../components/modals/JobCompletionFlyerModal';

export const FreelancerDashboardPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { formatDualPrice } = useCurrency();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'recommended'>('all');
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [wallet, setWallet] = useState<any | null>(null);
  const [proposalsCount, setProposalsCount] = useState(0);
  const [completedContracts, setCompletedContracts] = useState<any[]>([]);
  const [showFlyerModal, setShowFlyerModal] = useState(false);
  const [selectedFlyerContract, setSelectedFlyerContract] = useState<any>(null);

  const [uploadingCv, setUploadingCv] = useState(false);
  const [dismissedReminder, setDismissedReminder] = useState(false);

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    return `${days}d ago`;
  };

  // Profile completeness calculation
  const hasPhoto = Boolean(user?.profileImage);
  const hasBio = Boolean(user?.bio && user?.title);
  const hasSkills = Boolean(user?.skills && user?.skills.length > 0);
  const hasExperience = Boolean((user as any)?.workExperience?.length || (user as any)?.employment?.length || user?.yearsOfExperience);
  const hasCV = Boolean((user as any)?.resume || (user as any)?.cv);

  const completedCount = [hasPhoto, hasBio, hasSkills, hasExperience, hasCV].filter(Boolean).length;
  const completionPercentage = hasCV ? 100 : Math.round((completedCount / 5) * 100);
  const isIncomplete = !hasCV && completionPercentage < 100 && !dismissedReminder;

  const handleQuickCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast('CV file size must be under 10MB', 'error');
      return;
    }
    setUploadingCv(true);
    try {
      const res = await authAPI.uploadFile(file);
      const url = res?.data?.url || (res as any)?.url;
      if (url) {
        const updateRes = await authAPI.updateMe({ resume: url, cv: url });
        if (updateRes.success && updateRes.data) {
          updateUser(updateRes.data);
        }
        showToast('CV / Resume uploaded successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'CV upload failed.', 'error');
    } finally {
      setUploadingCv(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchSavedJobsList();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    setLoadingJobs(true);
    try {
      const [jobsRes, walletRes, propRes, contractsRes] = await Promise.all([
        activeTab === 'recommended' ? jobAPI.getRecommendedJobs().catch(() => null) : jobAPI.getAllJobs({ limit: 20 }).catch(() => null),
        walletAPI.getWallet().catch(() => null),
        proposalAPI.getMyProposals().catch(() => null),
        contractAPI.getUserContracts().catch(() => null),
      ]);

      if (jobsRes?.success && Array.isArray(jobsRes.data)) {
        setJobs(jobsRes.data);
      } else if (Array.isArray(jobsRes)) {
        setJobs(jobsRes as any);
      }

      if (walletRes?.success) {
        setWallet(walletRes.data);
      }

      if (propRes?.success && Array.isArray(propRes.data)) {
        setProposalsCount(propRes.data.length);
      } else if (Array.isArray(propRes)) {
        setProposalsCount(propRes.length);
      }

      if (contractsRes?.success && Array.isArray(contractsRes.data)) {
        setCompletedContracts(contractsRes.data.filter((c: any) => c.status === 'completed'));
      } else if (Array.isArray(contractsRes)) {
        setCompletedContracts((contractsRes as any[]).filter((c: any) => c.status === 'completed'));
      }
    } catch (err) {
      console.error('Failed to fetch freelancer dashboard data:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchSavedJobsList = async () => {
    try {
      const res = await savedJobAPI.getSavedJobs();
      const list = res?.data || (Array.isArray(res) ? res : []);
      const savedIds = new Set<string>(list.map((item: any) => item._id || item.id || item.jobId?._id));
      setSavedJobs(savedIds);
    } catch (err) {
      console.error('Failed to load saved jobs:', err);
    }
  };

  const toggleSaveJob = async (id: string) => {
    const isCurrentlySaved = savedJobs.has(id);
    setSavedJobs((prev) => {
      const updated = new Set(prev);
      if (isCurrentlySaved) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });

    try {
      if (isCurrentlySaved) {
        await savedJobAPI.removeSavedJob(id);
        showToast('Gig removed from saved bookmarks.', 'info');
      } else {
        await savedJobAPI.saveJob(id);
        showToast('Gig saved to your bookmarks!', 'success');
      }
    } catch (err) {
      console.error('Failed to update saved job persistence:', err);
      showToast('Failed to update saved gig status', 'error');
    }
  };

  return (
    <DashboardLayout>
      <MinimalistLoader loading={loadingJobs} />

      {/* ── Top Header Bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px', letterSpacing: '-0.02em' }}>
            Welcome back, {user?.firstName || 'Freelancer'}
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            Explore open projects, manage proposals, and track earnings.
          </p>
        </div>

        <button
          onClick={() => navigate('/jobs')}
          className="btn-primary"
          style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Search size={14} /> Explore All Jobs
        </button>
      </div>

      {/* ── Profile Completion & CV Upload Reminder Banner ── */}
      {isIncomplete && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--card-bg)',
            border: '1px solid rgba(253, 103, 48, 0.25)',
            borderRadius: '16px',
            padding: '14px 18px',
            marginBottom: '20px',
            position: 'relative',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '260px' }}>
            {/* Progress Circular Badge */}
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(253, 103, 48, 0.08)',
              border: '2px solid var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              flexShrink: 0
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{completionPercentage}%</span>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <Sparkles size={14} color="var(--primary)" />
                <h3 style={{ fontSize: '0.88rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Complete Profile & Attach CV
                </h3>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: 0 }}>
                Missing: {!hasCV && 'CV/Resume • '}{!hasExperience && 'Education & Experience • '}{!hasPhoto && 'Profile Photo • '}{!hasBio && 'Bio & Title'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!hasCV && (
              <button
                onClick={() => navigate('/dashboard/upload-cv')}
                style={{
                  padding: '7px 14px',
                  borderRadius: '10px',
                  background: 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <UploadCloud size={13} />
                Upload CV
              </button>
            )}

            <button
              onClick={() => navigate('/dashboard/profile')}
              style={{
                padding: '7px 12px',
                borderRadius: '10px',
                background: 'rgba(253, 103, 48, 0.08)',
                color: 'var(--primary)',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Complete Details <ChevronRight size={13} />
            </button>

            <button
              onClick={() => setDismissedReminder(true)}
              title="Dismiss"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={15} />
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Metric Stat Cards Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div style={{ padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Available Balance</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={14} />
            </div>
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {formatDualPrice(Number(wallet?.balance ?? 0))}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--success)', marginTop: '2px', display: 'block', fontWeight: 600 }}>Ready to withdraw</span>
        </div>

        <div style={{ padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Proposals</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={14} />
            </div>
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{proposalsCount}</div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>Submitted bids</span>
        </div>

        <div style={{ padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Available Jobs</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(253,103,48,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={14} />
            </div>
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{jobs.length}</div>
          <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600, marginTop: '2px', display: 'block' }}>Open for bidding</span>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="freelancer-dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' }}>
        {/* Left: Jobs Feed */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
              Latest Open Opportunities
            </h2>
            <button onClick={() => navigate('/jobs')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>
              View all <ChevronRight size={13} />
            </button>
          </div>

          {loadingJobs ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Loader2 size={20} className="animate-spin" style={{ margin: '0 auto 8px', color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.8rem' }}>Loading jobs...</span>
            </div>
          ) : jobs.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 4px' }}>No active projects found</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                Check back soon for new project postings.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {jobs.slice(0, 8).map((job) => {
                const isSaved = savedJobs.has(job._id || job.id);
                return (
                  <motion.div
                    key={job._id || job.id}
                    whileHover={{ y: -1, borderColor: 'var(--primary)' }}
                    transition={{ duration: 0.15 }}
                    onClick={() => navigate(`/jobs/${job._id}`)}
                    style={{
                      padding: '16px 20px',
                      borderRadius: '14px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--card-bg)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Top Title & Rate */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(253,103,48,0.08)', color: 'var(--primary)' }}>
                            {job.category || 'Development'}
                          </span>
                          {job.paymentVerified && (
                            <span title="Verified Client" style={{ color: 'var(--primary)', display: 'inline-flex' }}>
                              <CheckCircle2 size={13} strokeWidth={2.5} />
                            </span>
                          )}
                        </div>
                        <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                          {job.title}
                        </h3>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.01em' }}>
                          {formatJobBudget(Number(job.budget || 0), job.currency)}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {job.budgetType || 'fixed price'}
                        </span>
                      </div>
                    </div>

                    {/* Description Snippet */}
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {job.description}
                    </p>

                    {/* Footer Toolbar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {job.duration || 14} days est.
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveJob(job._id || job.id);
                          }}
                          style={{
                            background: isSaved ? 'rgba(239,68,68,0.1)' : 'var(--bg-tertiary)',
                            border: 'none',
                            borderRadius: '8px',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: isSaved ? '#EF4444' : 'var(--text-muted)',
                          }}
                        >
                          <Heart size={14} fill={isSaved ? '#EF4444' : 'none'} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/jobs/${job._id}`);
                          }}
                          className="btn-primary"
                          style={{ padding: '5px 12px', fontSize: '0.76rem', borderRadius: '8px', fontWeight: 700 }}
                        >
                          Apply <ArrowUpRight size={12} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Panel: Shortcuts & Pro Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 800, margin: '0 0 12px', color: 'var(--text-primary)' }}>Shortcuts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { label: 'My Proposals', icon: <Briefcase size={14} />, path: '/proposals' },
                { label: 'Saved Gigs', icon: <Bookmark size={14} color="var(--primary)" />, path: '/saved-gigs' },
                { label: 'Messages', icon: <MessageSquare size={14} />, path: '/messages' },
                { label: 'Wallet & Payouts', icon: <Wallet size={14} />, path: '/wallet' },
                { label: 'Profile Settings', icon: <User size={14} />, path: '/settings' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate(item.path)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.icon} {item.label}
                  </span>
                  <ChevronRight size={13} color="var(--text-muted)" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Notifications Card */}
          <div style={{ padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={15} color="var(--primary)" />
                <h3 style={{ fontSize: '0.88rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Notifications</h3>
                {unreadCount > 0 && (
                  <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.68rem', fontWeight: 800, padding: '1px 6px', borderRadius: '10px' }}>
                    {unreadCount}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }} onClick={() => navigate('/notifications')}>
                View All
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {notifications.length === 0 ? (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 8px' }}>
                  No recent notifications
                </div>
              ) : (
                notifications.slice(0, 4).map((notif: any) => {
                  const isUnread = notif.isRead === false || notif.read === false;
                  return (
                    <div
                      key={notif._id || notif.id}
                      onClick={() => {
                        if (isUnread) markAsRead(notif._id || notif.id);
                        if (notif.link) navigate(notif.link);
                        else navigate('/notifications');
                      }}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '10px',
                        background: !isUnread ? 'var(--bg-secondary)' : 'rgba(16, 185, 129, 0.08)',
                        border: `1px solid ${!isUnread ? 'var(--border-color)' : 'rgba(16, 185, 129, 0.25)'}`,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isUnread && (
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--primary)', marginTop: '4px', flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '4px' }}>
                          <div style={{ fontWeight: isUnread ? 700 : 600, fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                            {notif.title}
                          </div>
                          {notif.createdAt && (
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                              {formatTimeAgo(notif.createdAt)}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {notif.message}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Completed Contracts & Verified Certificates Card */}
          {completedContracts.length > 0 && (
            <div style={{ padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '0.88rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} color="var(--success)" /> Verified Deliveries
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {completedContracts.map((c: any) => (
                  <div key={c._id} style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                  }}>
                    <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px', lineHeight: 1.3 }}>
                      {c.title}
                    </h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--success)' }}>
                        {formatJobBudget(Number(c.totalPrice || 2500), c.currency || 'USD')}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedFlyerContract({
                            _id: c._id,
                            title: c.title,
                            totalPrice: Number(c.totalPrice || 2500),
                            currency: c.currency || 'USD',
                            clientName: c.clientId?.firstName ? `${c.clientId.firstName} ${c.clientId.lastName}` : 'Sarah Chen',
                            freelancerName: `${user?.firstName || 'Zainab'} ${user?.lastName || 'Usman'}`,
                            completedAt: c.updatedAt || new Date(),
                          });
                          setShowFlyerModal(true);
                        }}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--card-bg)',
                          color: 'var(--text-primary)',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Share Flyer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 4. Full Rich Job Details Modal Overlay with Client Profile Info ── */}
      {selectedJob && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }} onClick={() => setSelectedJob(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--card-bg)',
              borderRadius: '24px',
              padding: '32px',
              maxWidth: '720px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              border: '1px solid var(--border-color)',
              position: 'relative',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedJob(null)}
              style={{
                position: 'absolute',
                top: '24px',
                right: '24px',
                background: 'var(--bg-tertiary)',
                border: 'none',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
              }}
            >
              <X size={18} />
            </button>

            {/* Header Category & Verified */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', background: 'rgba(253,103,48,0.1)', color: 'var(--primary)' }}>
                {selectedJob.category || 'Software Development'}
              </span>
              {selectedJob.paymentVerified && (
                <span title="Verified Client" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, background: 'rgba(253,103,48,0.08)', padding: '3px 10px', borderRadius: '20px' }}>
                  <CheckCircle2 size={13} strokeWidth={2.5} /> Verified Payment
                </span>
              )}
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 16px', letterSpacing: '-0.01em', lineHeight: 1.3, paddingRight: '40px' }}>
              {selectedJob.title}
            </h2>

            {/* Client Profile Information Card */}
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
                {(selectedJob.company || selectedJob.clientId?.firstName || 'C')[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {selectedJob.company || `${selectedJob.clientId?.firstName || 'Connecta'} ${selectedJob.clientId?.lastName || 'Client'}`}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {selectedJob.location || 'Remote'}</span>
                  <span>• Posted recently</span>
                </div>
              </div>
            </div>

            {/* Budget, Type & Timeline Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '14px 16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <DollarSign size={13} color="var(--primary)" /> Budget
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>
                  {formatJobBudget(Number(selectedJob.budget || 0), selectedJob.currency)}
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '14px 16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Briefcase size={13} color="var(--primary)" /> Job Type
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px', textTransform: 'capitalize' }}>
                  {selectedJob.budgetType || 'Fixed Price'}
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '14px 16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={13} color="var(--primary)" /> Delivery Time
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {selectedJob.duration || 14} days
                </div>
              </div>
            </div>

            {/* Full Job Description */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>Full Job Description</h4>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {selectedJob.description}
              </p>
            </div>

            {/* Required Skills */}
            {selectedJob.skills && selectedJob.skills.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '10px', color: 'var(--text-primary)' }}>Required Skills & Technologies</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedJob.skills.map((skill: string, idx: number) => (
                    <span key={idx} style={{ fontSize: '0.8rem', fontWeight: 600, padding: '5px 12px', borderRadius: '20px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setSelectedJob(null);
                  navigate(`/jobs/${selectedJob._id}`);
                }}
                className="btn-primary"
                style={{ flex: 1, padding: '14px', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 700, justifyContent: 'center' }}
              >
                Apply Now <ArrowUpRight size={18} />
              </motion.button>
              <button
                onClick={() => setSelectedJob(null)}
                style={{ padding: '14px 22px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {selectedFlyerContract && (
        <JobCompletionFlyerModal
          isOpen={showFlyerModal}
          onClose={() => setShowFlyerModal(false)}
          contract={selectedFlyerContract}
        />
      )}
    </DashboardLayout>
  );
};
