import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle2, XCircle, Loader2, ArrowUpRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { proposalAPI } from '../../services/api';
import { CardSkeleton, MinimalistLoader } from '../../components/common/SkeletonLoader';
import { formatJobBudget } from '../../utils/currency';

export const MyProposalsPage: React.FC = () => {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const res = await proposalAPI.getMyProposals();
      if (res.success && Array.isArray(res.data)) {
        setProposals(res.data);
      } else if (Array.isArray(res)) {
        setProposals(res as any);
      }
    } catch (err) {
      console.error('Failed to load proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={13} /> Accepted</span>;
      case 'rejected':
        return <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', background: 'rgba(239,68,68,0.1)', color: '#EF4444', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><XCircle size={13} /> Declined</span>;
      default:
        return <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', background: 'rgba(253,103,48,0.1)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={13} /> Under Review</span>;
    }
  };

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          My Submitted Proposals
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
          Track status updates on all active bids and project proposals you have submitted.
        </p>
      </div>

      <MinimalistLoader loading={loading} />
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : proposals.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(253,103,48,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <FileText size={26} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>No proposals submitted yet</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '380px', margin: '0 auto 24px' }}>
            Explore available client jobs and submit your first project proposal to get hired.
          </p>
          <button onClick={() => navigate('/jobs')} className="btn-primary" style={{ padding: '12px 22px', fontSize: '0.88rem' }}>
            <Search size={16} /> Browse Open Jobs
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {proposals.map((item) => (
            <motion.div
              key={item._id}
              whileHover={{ y: -2 }}
              className="glass-card"
              style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--border-color)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ marginBottom: '6px' }}>{getStatusBadge(item.status)}</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {item.jobId?.title || 'Project Proposal'}
                  </h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {formatJobBudget(Number(item.bidAmount || 0), item.jobId?.currency)}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Your Bid</span>
                </div>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {item.coverLetter}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', marginTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Submitted on {new Date(item.createdAt).toLocaleDateString()}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => navigate(`/proposals/${item._id}`)}
                    style={{ padding: '8px 16px', fontSize: '0.82rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Review Proposal
                  </button>
                  <button
                    onClick={() => navigate(`/jobs/${item.jobId?._id}`)}
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.82rem', borderRadius: '8px' }}
                  >
                    View Job <ArrowUpRight size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};
