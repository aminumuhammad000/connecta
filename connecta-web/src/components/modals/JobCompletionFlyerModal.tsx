import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Share2, Copy, Check, ShieldCheck, X, Download, Loader2, Send, Image as ImageIcon
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { useToast } from '../../contexts/ToastContext';
import { formatJobBudget } from '../../utils/currency';
import { Logo } from '../common/Logo';

interface JobCompletionFlyerModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: {
    _id?: string;
    title: string;
    description?: string;
    totalPrice: number;
    currency?: string;
    completedAt?: string | Date;
    clientName?: string;
    freelancerName?: string;
    clientAvatar?: string;
    freelancerAvatar?: string;
    skills?: string[];
    type?: 'contract' | 'job_hired' | 'permanent' | 'hired' | 'job' | string;
    workMode?: 'online' | 'remote' | 'on-site' | 'in-person' | 'hybrid' | string;
    paymentType?: 'monthly' | 'fixed' | 'hourly' | string;
  };
}

export const JobCompletionFlyerModal: React.FC<JobCompletionFlyerModalProps> = ({
  isOpen,
  onClose,
  contract,
}) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const shareableUrl = `${window.location.origin}/contracts/${contract._id || 'completed'}`;
  const formattedDate = new Date(contract.completedAt || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    showToast('Flyer link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const shareText = `Verified Contract Completion on Connecta!\nProject: "${contract.title}"\nEarned/Paid: ${formatJobBudget(contract.totalPrice, contract.currency)}\nVerified Escrow Release`;

  const generateFlyerCanvas = async () => {
    const flyerElement = document.getElementById('job-completion-flyer');
    if (!flyerElement) return null;
    return await html2canvas(flyerElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#FFFFFF',
      logging: false,
    });
  };

  const handleDownloadImage = async () => {
    try {
      setIsGenerating(true);
      const canvas = await generateFlyerCanvas();
      if (!canvas) {
        showToast('Could not capture flyer image', 'error');
        return;
      }
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Connecta_Job_Flyer_${contract._id ? String(contract._id).slice(-6) : 'completed'}.png`;
      link.href = dataUrl;
      link.click();
      showToast('Flyer PNG image downloaded successfully!', 'success');
    } catch (err) {
      showToast('Failed to generate flyer image', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareImage = async () => {
    try {
      setIsGenerating(true);
      const canvas = await generateFlyerCanvas();
      if (!canvas) {
        showToast('Could not capture flyer image', 'error');
        return;
      }

      const imageUrl = canvas.toDataURL('image/png');

      // Post flyer image directly to Connecta Platform Feed
      const { feedAPI } = await import('../../services/api');
      await feedAPI.createPost({
        title: `Verified Escrow Delivery: ${contract.title}`,
        body: `🎉 Verified Contract Delivery & Escrow Release!\n\nProject: "${contract.title}"\nValue: ${formatJobBudget(contract.totalPrice, contract.currency)}\nClient: ${contract.clientName || 'Client'}\nFreelancer: ${contract.freelancerName || 'Freelancer'}`,
        imageUrl,
        actorName: contract.freelancerName || 'Verified Freelancer',
        actorRole: 'Verified Freelancer',
      });

      showToast('Verified job flyer shared directly to Connecta Feeds!', 'success');
      onClose();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to share flyer to feed', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareableUrl)}`;
    window.open(url, '_blank');
  };

  const handleLinkedInShare = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableUrl)}`;
    window.open(url, '_blank');
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareableUrl)}`;
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.2 }}
          style={{
            maxWidth: '520px',
            width: '100%',
            background: '#0B0F17',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 30px 70px rgba(0, 0, 0, 0.6)',
            position: 'relative'
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              zIndex: 10,
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)'
            }}
          >
            <X size={16} />
          </button>

          {/* FLYER CARD MATCHING TEMPLATE EXACTLY */}
          <div id="job-completion-flyer" style={{
            padding: '36px 32px 20px',
            background: '#FFFFFF',
            color: '#0B0F17',
            position: 'relative',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            overflow: 'hidden',
            boxSizing: 'border-box'
          }}>
            {/* Top Right Hanging Lamp Graphic */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: '28px',
              zIndex: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pointerEvents: 'none'
            }}>
              {/* Hanging Wire */}
              <div style={{ width: '2px', height: '48px', background: '#6D4C41' }} />
              {/* Lamp Shade */}
              <svg width="100" height="50" viewBox="0 0 100 50">
                <polygon points="50,0 0,50 100,50" fill="#C0CA33" />
                <polygon points="50,0 20,50 80,50" fill="#D4E157" />
                <circle cx="50" cy="50" r="10" fill="#FDD835" />
              </svg>
              {/* Glowing Aura */}
              <div style={{
                width: '140px',
                height: '100px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255, 235, 59, 0.45) 0%, rgba(255, 235, 59, 0.1) 60%, transparent 80%)',
                marginTop: '-30px',
                filter: 'blur(12px)'
              }} />
            </div>

            {/* 1. Header: Official Connecta Logo */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              marginBottom: '32px',
              position: 'relative',
              zIndex: 2
            }}>
              <Logo height={42} />
            </div>

            {/* 2. Dynamic Headline: Bold Impact Typography */}
            {contract.type === 'job_hired' || contract.type === 'permanent' || contract.type === 'hired' || contract.type === 'job' ? (
              <div style={{
                fontFamily: '"Impact", "Trebuchet MS", "Arial Black", sans-serif',
                fontSize: '2.7rem',
                fontWeight: 900,
                lineHeight: 0.95,
                letterSpacing: '-0.02em',
                marginBottom: '16px',
                position: 'relative',
                zIndex: 2
              }}>
                <div style={{ color: '#FD6730' }}>YOU GOT</div>
                <div style={{ color: '#FD6730' }}>HIRED!</div>
                <div style={{ color: '#0B0F17' }}>OFFER</div>
                <div style={{ color: '#FD6730' }}>ACCEPTED.</div>
              </div>
            ) : (
              <div style={{
                fontFamily: '"Impact", "Trebuchet MS", "Arial Black", sans-serif',
                fontSize: '2.7rem',
                fontWeight: 900,
                lineHeight: 0.95,
                letterSpacing: '-0.02em',
                marginBottom: '16px',
                position: 'relative',
                zIndex: 2
              }}>
                <div style={{ color: '#FD6730' }}>YOUR CONTRACT</div>
                <div style={{ color: '#FD6730' }}>COMPLETED.</div>
                <div style={{ color: '#0B0F17' }}>ESCROW</div>
                <div style={{ color: '#FD6730' }}>RELEASED.</div>
              </div>
            )}

            {/* 3. Subheadline */}
            <div style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#0B0F17',
              marginBottom: '24px',
              position: 'relative',
              zIndex: 2
            }}>
              <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 600, color: '#FD6730' }}>
                {contract.type === 'job_hired' || contract.type === 'permanent' || contract.type === 'hired' || contract.type === 'job' ? 'It Pays ' : 'It Paid '}
              </span>
              <span style={{ color: '#FD6730', fontWeight: 900, fontSize: '1.2rem' }}>
                {formatJobBudget(contract.totalPrice, contract.currency)}
                {contract.paymentType === 'monthly' ? '/mo' : ''}
              </span>
              <span>.....</span>
            </div>

            {/* 4. Contract Specification Card */}
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '16px 18px',
              marginBottom: '20px',
              position: 'relative',
              zIndex: 2,
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#FD6730', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {contract.type === 'job_hired' || contract.type === 'permanent' || contract.type === 'hired' || contract.type === 'job' ? 'JOB OFFER' : 'PROJECT'}
                </div>
                {contract.workMode && (
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                    {contract.workMode}
                  </div>
                )}
              </div>

              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 10px', lineHeight: 1.3 }}>
                {contract.title}
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '10px', borderTop: '1px dashed #CBD5E1' }}>
                <div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748B', display: 'block', textTransform: 'uppercase' }}>
                    {contract.type === 'job_hired' || contract.type === 'permanent' || contract.type === 'hired' || contract.type === 'job' ? 'Employer' : 'Client'}
                  </span>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>{contract.clientName || 'Sarah Chen'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748B', display: 'block', textTransform: 'uppercase' }}>
                    {contract.type === 'job_hired' || contract.type === 'permanent' || contract.type === 'hired' || contract.type === 'job' ? 'Employee' : 'Freelancer'}
                  </span>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>{contract.freelancerName || 'Zainab Usman'}</span>
                </div>
              </div>
            </div>

            {/* 5. Bottom Graphic Area: Concentric Arches + Team Cartoon Illustration */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              position: 'relative',
              minHeight: '160px',
              marginTop: '8px'
            }}>
              {/* Bottom Left Concentric Arch Graphic */}
              <div style={{ position: 'absolute', bottom: '-20px', left: '-25px', zIndex: 1, pointerEvents: 'none' }}>
                <svg width="150" height="150" viewBox="0 0 150 150">
                  <circle cx="0" cy="150" r="140" fill="none" stroke="#FD6730" strokeWidth="2.5" opacity="0.18" />
                  <circle cx="0" cy="150" r="115" fill="none" stroke="#FD6730" strokeWidth="2.5" opacity="0.22" />
                  <circle cx="0" cy="150" r="90" fill="none" stroke="#FD6730" strokeWidth="2.5" opacity="0.28" />
                  <circle cx="0" cy="150" r="65" fill="none" stroke="#FD6730" strokeWidth="2.5" opacity="0.35" />
                  <circle cx="0" cy="150" r="40" fill="none" stroke="#FD6730" strokeWidth="2.5" opacity="0.45" />
                </svg>
              </div>

              {/* Bottom Right Cartoon Team Illustration */}
              <div style={{ marginLeft: 'auto', position: 'relative', zIndex: 2 }}>
                <img
                  src="/illustrations/flyer_team_cartoon.jpg"
                  alt="Team Collaboration"
                  style={{
                    width: '210px',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '12px'
                  }}
                />
              </div>
            </div>

            {/* Bottom Footer ID Stamp */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.68rem',
              color: '#94A3B8',
              fontFamily: 'monospace',
              paddingTop: '12px',
              borderTop: '1px solid #F1F5F9',
              marginTop: '10px'
            }}>
              <span>ID: #{contract._id ? String(contract._id).slice(-8).toUpperCase() : 'CN-COMPLETED'}</span>
              <span>VERIFIED ON CONNECTA · {formattedDate}</span>
            </div>
          </div>

          {/* ACTION BUTTONS & SHARING TOOLBAR */}
          <div style={{
            padding: '20px 24px 24px',
            background: '#090D16',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleShareImage}
                disabled={isGenerating}
                className="btn-primary"
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  opacity: isGenerating ? 0.7 : 1
                }}
              >
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Share to Connecta Feed
              </button>

              <button
                onClick={handleDownloadImage}
                disabled={isGenerating}
                style={{
                  padding: '12px 18px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#F8FAFC',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  opacity: isGenerating ? 0.7 : 1
                }}
              >
                <Download size={16} />
                Download PNG
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleCopyLink}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: '#F8FAFC',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  cursor: 'pointer'
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>

              <button
                onClick={handleTwitterShare}
                style={{
                  padding: '9px 12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: '#F8FAFC',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Share on X
              </button>

              <button
                onClick={handleLinkedInShare}
                style={{
                  padding: '9px 12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: '#F8FAFC',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                LinkedIn
              </button>

              <button
                onClick={handleWhatsAppShare}
                style={{
                  padding: '9px 12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: '#F8FAFC',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                WhatsApp
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
