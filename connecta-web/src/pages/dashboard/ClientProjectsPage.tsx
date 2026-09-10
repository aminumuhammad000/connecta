import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Search, ArrowUpRight, PlusCircle, CheckCircle2, ShieldCheck, Clock, FileCheck, Star, Share2, X, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { projectAPI, contractAPI } from '../../services/api';
import { CardSkeleton, MinimalistLoader } from '../../components/common/SkeletonLoader';
import { formatJobBudget } from '../../utils/currency';
import { JobCompletionFlyerModal } from '../../components/modals/JobCompletionFlyerModal';

export const ClientProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Active' | 'Delivered' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Flyer Modal State
  const [showFlyerModal, setShowFlyerModal] = useState(false);
  const [selectedFlyerContract, setSelectedFlyerContract] = useState<any>(null);

  // Deliverable Review Modal State
  const [reviewingContract, setReviewingContract] = useState<any | null>(null);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projRes, contractRes] = await Promise.all([
        projectAPI.getClientProjects().catch(() => ({ data: [] })),
        contractAPI.getUserContracts().catch(() => ({ data: [] }))
      ]);

      const projData = Array.isArray(projRes) ? projRes : projRes?.data || [];
      const contrData = Array.isArray(contractRes) ? contractRes : contractRes?.data || [];

      setProjects(projData);
      setContracts(contrData);
    } catch (err) {
      console.error('Failed to fetch client projects/contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Combine projects & contracts into unified items for the client view
  const combinedItems = [
    ...contracts.map((c) => ({
      id: c._id,
      isContract: true,
      title: c.title,
      description: c.description || 'Active contract for milestone deliverables.',
      amount: c.totalPrice || c.totalAmount || 0,
      currency: c.currency || 'USD',
      status: c.status,
      paymentStatus: c.paymentStatus || 'escrow',
      freelancerName: c.freelancerId?.firstName
        ? `${c.freelancerId.firstName} ${c.freelancerId.lastName}`
        : 'Freelancer',
      freelancerId: c.freelancerId?._id || c.freelancerId,
      submission: c.submission,
      raw: c
    })),
    ...projects
      .filter((p) => !contracts.some((c) => c.jobId === p._id || c.projectId === p._id))
      .map((p) => ({
        id: p._id,
        isContract: false,
        title: p.title,
        description: p.description,
        amount: Number(p.budget || 0),
        currency: p.currency || 'USD',
        status: p.status === 'closed' ? 'completed' : p.status || 'active',
        paymentStatus: p.paymentStatus || 'pending',
        freelancerName: p.freelancerId?.firstName
          ? `${p.freelancerId.firstName} ${p.freelancerId.lastName}`
          : null,
        freelancerId: p.freelancerId?._id || p.freelancerId,
        submission: null,
        raw: p
      }))
  ];

  const filteredItems = combinedItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === 'Active') return item.status === 'active' || item.status === 'in_progress';
    if (activeFilter === 'Delivered') return item.status === 'delivered' || item.status === 'submitted';
    if (activeFilter === 'Completed') return item.status === 'completed';
    return true;
  });

  const handleApproveWork = async (contractId: string) => {
    setApproving(true);
    try {
      await contractAPI.approveWork(contractId);
      setReviewingContract(null);
      await fetchData();

      // Find target contract to display flyer
      const target = combinedItems.find((i) => i.id === contractId);
      if (target) {
        setSelectedFlyerContract({
          _id: target.id,
          title: target.title,
          totalPrice: target.amount,
          currency: target.currency,
          clientName: 'Sarah Chen',
          freelancerName: target.freelancerName || 'Zainab Usman',
          completedAt: new Date().toISOString()
        });
        setShowFlyerModal(true);
      }
    } catch (err: any) {
      console.error('Failed to approve work:', err);
      alert(err.response?.data?.message || 'Failed to approve deliverable and release escrow.');
    } finally {
      setApproving(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            My Jobs & Projects
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
            Manage client postings, review submitted work deliverables, release escrow, and generate completion flyers.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/jobs/new')}
          className="btn-primary"
          style={{ padding: '10px 20px', borderRadius: '12px', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <PlusCircle size={17} /> Post a Job
        </motion.button>
      </div>

      {/* Filter Chips & Search Bar */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search projects or contracts by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '40px', width: '100%', borderRadius: '12px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {(['All', 'Active', 'Delivered', 'Completed'] as const).map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveFilter(chip)}
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                border: activeFilter === chip ? 'none' : '1px solid var(--border-color)',
                background: activeFilter === chip ? 'var(--primary)' : 'var(--card-bg)',
                color: activeFilter === chip ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {chip === 'Delivered' ? 'To Review' : chip}
            </button>
          ))}
        </div>
      </div>

      {/* Projects & Contracts List */}
      <MinimalistLoader loading={loading} />
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', borderRadius: '20px' }}>
          <Briefcase size={32} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 6px' }}>No projects or contracts found</h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            You don't have any projects under this filter at the moment.
          </p>
          <button onClick={() => navigate('/jobs/new')} className="btn-primary" style={{ padding: '10px 20px' }}>
            Post a Project Now
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredItems.map((item) => {
            const isCompleted = item.status === 'completed';
            const isDelivered = item.status === 'delivered' || item.status === 'submitted';

            return (
              <motion.div
                key={item.id}
                whileHover={{ y: -2 }}
                className="glass-card"
                style={{
                  padding: '24px',
                  borderRadius: '20px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--card-bg)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '20px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '8px', background: 'rgba(253,103,48,0.1)', color: 'var(--primary)' }}>
                      {item.isContract ? 'Active Contract' : 'Job Listing'}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '8px',
                        background: isCompleted ? 'rgba(16,185,129,0.1)' : isDelivered ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)',
                        color: isCompleted ? 'var(--success)' : isDelivered ? '#F59E0B' : 'var(--info, #3B82F6)'
                      }}
                    >
                      {isCompleted ? 'Completed' : isDelivered ? 'Deliverable Submitted' : 'In Progress'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 10px', lineHeight: 1.45 }}>
                    {item.description}
                  </p>

                  {item.freelancerName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>Freelancer:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{item.freelancerName}</strong>
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end', flexShrink: 0 }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {formatJobBudget(item.amount, item.currency)}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {isDelivered && (
                      <button
                        onClick={() => setReviewingContract(item)}
                        className="btn-primary"
                        style={{ padding: '8px 14px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, background: '#10B981', borderColor: '#10B981' }}
                      >
                        <FileCheck size={15} /> Review & Release Escrow
                      </button>
                    )}

                    {isCompleted && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedFlyerContract({
                              _id: item.id,
                              title: item.title,
                              totalPrice: item.amount,
                              currency: item.currency,
                              clientName: 'Sarah Chen',
                              freelancerName: item.freelancerName || 'Zainab Usman',
                              completedAt: item.raw.updatedAt || new Date().toISOString(),
                            });
                            setShowFlyerModal(true);
                          }}
                          style={{ padding: '8px 14px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600, background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Share2 size={14} /> Flyer
                        </button>
                        <button
                          onClick={() => navigate('/client/reviews/new', { state: { projectId: item.id, revieweeId: item.freelancerId, freelancerName: item.freelancerName, jobTitle: item.title } })}
                          style={{ padding: '8px 14px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, background: 'rgba(253,103,48,0.1)', color: 'var(--primary)', border: '1px solid var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Star size={14} /> Review
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => navigate(`/jobs/${item.id}`)}
                      style={{ padding: '8px 14px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600, background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      Details <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Deliverable Review Modal */}
      <AnimatePresence>
        {reviewingContract && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '20px' }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card"
              style={{ background: 'var(--card-bg)', width: '100%', maxWidth: '520px', borderRadius: '24px', padding: '28px', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Inspect Work Deliverable
                </h3>
                <button onClick={() => setReviewingContract(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '14px', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Project Title</div>
                <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
                  {reviewingContract.title}
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Deliverable Summary</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {reviewingContract.submission?.summary || 'The freelancer has submitted all code repositories and design assets for your review.'}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px', marginBottom: '24px' }}>
                <ShieldCheck size={22} color="#10B981" />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Approving will release <strong style={{ color: 'var(--text-primary)' }}>{formatJobBudget(reviewingContract.amount, reviewingContract.currency)}</strong> from Escrow to the freelancer.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setReviewingContract(null)}
                  style={{ padding: '10px 18px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  Cancel
                </button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={approving}
                  onClick={() => handleApproveWork(reviewingContract.id)}
                  className="btn-primary"
                  style={{ padding: '10px 22px', borderRadius: '12px', fontWeight: 700, fontSize: '0.88rem', background: '#10B981', borderColor: '#10B981', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {approving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  Approve & Release Escrow
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Completion Flyer Modal */}
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
