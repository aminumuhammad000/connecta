import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, Link as LinkIcon, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { authAPI } from '../../services/api';

interface VerificationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const VerificationRequestModal: React.FC<VerificationRequestModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { success, error } = useToast();
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [skillProofs, setSkillProofs] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await authAPI.requestVerification({
        githubUrl: githubUrl.trim(),
        portfolioUrl: portfolioUrl.trim(),
        skillProofs: skillProofs.trim()
      });

      if (res.success) {
        success('Request Submitted', 'Your profile has been submitted for Connecta Vetted Pro verification!');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        error('Failed', res.message || 'Could not submit verification request');
      }
    } catch (err: any) {
      error('Error', err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass-card"
          style={{
            maxWidth: '560px',
            width: '100%',
            padding: '32px',
            position: 'relative',
            borderRadius: 'var(--radius-xl)'
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#10B981'
            }}>
              <ShieldCheck size={28} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Request "Connecta Verified" Status
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Vetted talent receives 3x more enterprise invites, direct client shortlisting, and high-budget full-time contract offers.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">GitHub / GitLab Profile URL</label>
              <div className="input-wrapper">
                <LinkIcon className="input-icon-left" size={18} />
                <input
                  type="url"
                  placeholder="https://github.com/yourusername"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Portfolio / Case Study Website</label>
              <div className="input-wrapper">
                <LinkIcon className="input-icon-left" size={18} />
                <input
                  type="url"
                  placeholder="https://yourportfolio.com"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Key Skills & Highlight Projects</label>
              <textarea
                placeholder="Briefly describe your recent tech achievements, system architectures, or team leadership..."
                value={skillProofs}
                onChange={(e) => setSkillProofs(e.target.value)}
                className="input-field"
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Sparkles size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
              <span>Connecta Talent Vetting team reviews requests within 24-48 hours.</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 'var(--radius-lg)',
                fontWeight: 700,
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
              Submit Vetting Request
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
