import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Star, ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { reviewAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

export const ClientWriteReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const stateData = (location.state as any) || {};
  const { projectId, revieweeId, freelancerName = 'Usman Umar', jobTitle = 'Senior Full-Stack Engineer' } = stateData;

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('Please provide feedback comments for the freelancer.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await reviewAPI.createReview({
        projectId,
        revieweeId: revieweeId || 'freelancer-1',
        reviewerType: 'client',
        rating,
        comment,
      });
      showToast('Review and rating published successfully!', 'success');
      navigate('/client/projects');
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      showToast(err.response?.data?.message || 'Failed to submit review. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
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
            marginBottom: '14px',
          }}
        >
          <ArrowLeft size={16} /> Back to Projects
        </button>

        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          Rate & Review Freelancer
        </h1>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
          Share your feedback and rate the delivered project performance to help build African talent reputation on Connecta.
        </p>
      </div>

      <div className="glass-card" style={{ maxWidth: '640px', padding: '32px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
        {/* Freelancer Header Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
            alt={freelancerName}
            style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
          />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{freelancerName}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>{jobTitle}</div>
          </div>
        </div>

        <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Star Rating Picker */}
          <div>
            <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '10px' }}>
              Overall Star Rating
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'transform 0.15s ease',
                  }}
                >
                  <Star
                    size={32}
                    fill={star <= rating ? '#F59E0B' : 'transparent'}
                    color={star <= rating ? '#F59E0B' : 'var(--text-muted)'}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
              Written Feedback & Performance Experience
            </label>
            <textarea
              rows={5}
              placeholder="Describe freelancer communication, speed of delivery, code quality, and adherence to milestones..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input-field"
              style={{ width: '100%', lineHeight: 1.5 }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              type="button"
              onClick={() => navigate('/client/projects')}
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
              style={{ padding: '12px 28px', borderRadius: '12px', fontWeight: 700 }}
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Submit Review
            </motion.button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
