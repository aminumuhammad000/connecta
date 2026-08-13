import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  Briefcase, Wallet, Star, ArrowUpRight, Search, CheckCircle2, TrendingUp,
  Clock, MapPin, Loader2, Heart, Building2, Sparkles, X, DollarSign, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeaderArt } from '../../components/common/DashboardHeaderArt';
import { jobAPI, proposalAPI, walletAPI } from '../../services/api';
import { MinimalistLoader } from '../../components/common/SkeletonLoader';
import { formatJobBudget } from '../../utils/currency';
import { useCurrency } from '../../contexts/CurrencyContext';

export const FreelancerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { formatDualPrice } = useCurrency();

  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'recommended'>('all');
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [wallet, setWallet] = useState<any | null>(null);
  const [proposalsCount, setProposalsCount] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    setLoadingJobs(true);
    try {
      const [jobsRes, walletRes, propRes] = await Promise.all([
        activeTab === 'recommended' ? jobAPI.getRecommendedJobs().catch(() => null) : jobAPI.getAllJobs({ limit: 20 }).catch(() => null),
        walletAPI.getWallet().catch(() => null),
        proposalAPI.getMyProposals().catch(() => null),
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
    } catch (err) {
      console.error('Failed to fetch freelancer dashboard data:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const toggleSaveJob = (id: string) => {
    setSavedJobs((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  return (
    <DashboardLayout>
      <MinimalistLoader loading={loadingJobs} />
      {/* ── 1. Hero Welcome Banner ── */}
      <motion.div
        className="dashboard-hero-card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'var(--grad-primary)',
          borderRadius: '18px',
          padding: '20px 28px',
          color: '#ffffff',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 25px rgba(253,103,48,0.18)',
        }}
      >
        {/* Background Vector Art Overlay */}
        <div style={{
          position: 'absolute',
          right: '-20px',
          top: '-20px',
          bottom: '-20px',
          width: '300px',
          opacity: 0.25,
          pointerEvents: 'none',
          zIndex: 1,
        }}>
          <DashboardHeaderArt />
        </div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(10px)',
            padding: '3px 10px',
            borderRadius: '16px',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            marginBottom: '6px',
            textTransform: 'uppercase',
          }}>
            <Sparkles size={12} /> Freelancer Workspace
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 4px', color: '#fff', letterSpacing: '-0.02em' }}>
            Welcome back, {user?.firstName || 'Freelancer'}
          </h1>
          <p style={{ opacity: 0.92, fontSize: '0.85rem', maxWidth: '480px', lineHeight: 1.4, margin: 0 }}>
            Explore open tech & creative projects, submit proposals, and earn securely.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '10px' }}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/jobs')}
            style={{
              background: '#ffffff',
              color: 'var(--primary)',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <Search size={15} /> Find Work
          </motion.button>
        </div>
      </motion.div>

      {/* ── 2. Profile Completion Tracker Banner (Matches Mobile FreelancerDashboardScreen) ── */}
      {(!user?.bio || !user?.location || !user?.title) && (
        <div className="glass-card" style={{ padding: '18px 24px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '20px', background: 'var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--primary)" /> Complete Your Professional Profile
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Complete your bio, tech stack, and location to boost your job match score by 85%.
            </p>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="btn-primary"
            style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700 }}
          >
            Complete Profile Now
          </button>
        </div>
      )}

      {/* ── 3. Compact Metric Stats Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <motion.div
          whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(0,0,0,0.05)' }}
          transition={{ duration: 0.2 }}
          className="glass-card"
          style={{ padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--border-color)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Earnings</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {formatDualPrice(Number(wallet?.balance ?? 0))}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '2px', display: 'block', fontWeight: 600 }}>Available for withdrawal</span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(0,0,0,0.05)' }}
          transition={{ duration: 0.2 }}
          className="glass-card"
          style={{ padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--border-color)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Proposals</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{proposalsCount}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>Submitted proposals</span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(0,0,0,0.05)' }}
          transition={{ duration: 0.2 }}
          className="glass-card"
          style={{ padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--border-color)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Available Jobs</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245,158,11,0.1)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{jobs.length}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
            <TrendingUp size={12} /> Open Opportunities
          </span>
        </motion.div>
      </div>

      {/* ── 3. Main Content Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '28px' }}>

        {/* Left: Jobs Feed */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Explore Available Jobs ({jobs.length})
            </h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setActiveTab('all')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: activeTab === 'all' ? 'var(--primary)' : 'var(--bg-tertiary)',
                  color: activeTab === 'all' ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease',
                }}
              >
                All Jobs
              </button>
            </div>
          </div>

          {loadingJobs ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 10px' }} />
              <span>Loading latest open opportunities...</span>
            </div>
          ) : jobs.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', borderRadius: '18px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(253,103,48,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Search size={26} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>No active projects found</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '360px', margin: '0 auto 20px' }}>
                Check back soon or update your job search filters.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {jobs.map((job) => {
                const isSaved = savedJobs.has(job._id || job.id);
                return (
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
                    {/* Top Row: Category Pill, Orange Check Tick Badge & Save Heart */}
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
                              title="Verified Client"
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
                            <Building2 size={13} /> {job.company || 'Direct Client'}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={13} /> {job.location || 'Remote'}
                          </span>
                        </div>
                      </div>

                      {/* Right Budget Callout & Heart Save */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveJob(job._id || job.id);
                          }}
                          style={{
                            background: isSaved ? 'rgba(239,68,68,0.1)' : 'var(--bg-tertiary)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '34px',
                            height: '34px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: isSaved ? '#EF4444' : 'var(--text-muted)',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Heart size={16} fill={isSaved ? '#EF4444' : 'none'} />
                        </motion.button>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.01em' }}>
                            {formatJobBudget(Number(job.budget || 0), job.currency)}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                            {job.budgetType || 'fixed price'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Job Description */}
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                      {job.description}
                    </p>

                    {/* Skills Pills */}
                    {job.skills && job.skills.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {job.skills.map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              padding: '4px 10px',
                              borderRadius: '20px',
                              background: 'var(--bg-tertiary)',
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border-color)',
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Card Footer Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} /> Est. Delivery: {job.duration || 14} days
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
                        Apply Now <ArrowUpRight size={15} />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Panel: Quick Actions & Profile Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <motion.button
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/register/profile-setup')}
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
                  <CheckCircle2 size={16} color="var(--primary)" /> Complete Profile Bio
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
                  <Wallet size={16} color="var(--primary)" /> View Wallet & Earnings
                </span>
                <ArrowUpRight size={16} />
              </motion.button>
            </div>
          </div>
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
    </DashboardLayout>
  );
};
