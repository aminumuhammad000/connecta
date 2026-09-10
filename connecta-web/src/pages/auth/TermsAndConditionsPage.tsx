import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, ScrollText } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import confetti from 'canvas-confetti';

import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';

export const TermsAndConditionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();

  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Monitor scroll position of terms container
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      // Allow a 25px threshold for bottom detection
      if (scrollTop + clientHeight >= scrollHeight - 25) {
        setHasScrolledToBottom(true);
      }
    }
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      // Check if text is short enough to not scroll
      if (el.scrollHeight <= el.clientHeight) {
        setHasScrolledToBottom(true);
      }
    }
  }, []);

  const handleAccept = async () => {
    if (!hasScrolledToBottom) {
      error('Scroll Required', 'Please scroll down and read the terms before accepting');
      return;
    }
    if (!agreed) {
      error('Agreement Required', 'Please check the box to accept the Terms and Conditions');
      return;
    }

    setAccepting(true);
    try {
      const res = await authAPI.updateMe({ termsAccepted: true });
      if (res.success && res.data) {
        updateUser(res.data);
      }
    } catch (e) {
      console.warn('Could not save terms acceptance flag:', e);
    } finally {
      setAccepting(false);
    }

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    success('Terms Accepted', 'Welcome to Connecta!');
    navigate('/register/setup-progress');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Navbar />

      <main style={{
        flex: 1,
        maxWidth: '680px',
        margin: '0 auto',
        padding: '30px 20px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{ padding: '32px 28px', width: '100%' }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 12px',
              borderRadius: '20px',
              background: 'rgba(253, 103, 48, 0.08)',
              color: 'var(--primary)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.4px',
              marginBottom: '10px'
            }}>
              Legal & Platform Terms
            </div>

            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '4px', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              Terms & Conditions
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              Read and accept terms to activate your workspace
            </p>
          </div>

          {/* Scroll Callout Indicator */}
          {!hasScrolledToBottom && (
            <div style={{
              background: 'rgba(253, 103, 48, 0.06)',
              border: '1px solid rgba(253, 103, 48, 0.2)',
              borderRadius: '10px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
              color: 'var(--primary)'
            }}>
              <ScrollText size={16} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                Please scroll to the end of the terms document below
              </span>
            </div>
          )}

          {/* Terms Content Scroll Box */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            style={{
              maxHeight: '300px',
              overflowY: 'auto',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '18px 20px',
              fontSize: '0.82rem',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              marginBottom: '20px'
            }}
          >
            <h3 style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px' }}>
              1. Acceptance of Terms
            </h3>
            <p style={{ marginBottom: '14px' }}>
              By creating an account on Connecta, accessing our services, or interacting with freelancers or clients on the platform, you agree to be bound by these Terms and Conditions. If you do not agree to all terms, you may not access or use Connecta.
            </p>

            <h3 style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px' }}>
              2. User Accounts & Verification
            </h3>
            <p style={{ marginBottom: '14px' }}>
              Users must provide accurate, complete registration information. You are responsible for safeguarding your credentials. Connecta reserves the right to verify user identities, sectors, and currencies to maintain platform trust.
            </p>

            <h3 style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px' }}>
              3. Payments, Escrow & Work Protection
            </h3>
            <p style={{ marginBottom: '14px' }}>
              All client payments are held securely in escrow until milestone deliverables are reviewed and approved. Connecta supports multiple African and global currencies (USD, NGN, GHS, KES, ZAR). Direct off-platform payments are strictly prohibited and may result in account termination.
            </p>

            <h3 style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px' }}>
              4. Code of Conduct & Fair Play
            </h3>
            <p style={{ marginBottom: '14px' }}>
              Freelancers and clients agree to maintain respectful, professional communication. Spam, abusive language, copyright infringement, and unauthorized data scraping are grounds for immediate suspension.
            </p>

            <h3 style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px' }}>
              5. Intellectual Property Rights
            </h3>
            <p style={{ marginBottom: '14px' }}>
              Upon full escrow milestone payout, all intellectual property rights for custom deliverables transfer from the freelancer to the client, unless explicitly stated otherwise in project contracts.
            </p>

            <h3 style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px' }}>
              6. Limitation of Liability
            </h3>
            <p style={{ marginBottom: '0' }}>
              Connecta acts as a marketplace facilitator. While we enforce verification and escrow protection, Connecta is not liable for indirect damages or external contractual disputes beyond our managed escrow resolution protocols.
            </p>
          </div>

          {/* Checkbox Agreement Area */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: agreed ? 'rgba(16, 185, 129, 0.06)' : 'var(--bg-secondary)',
            border: agreed ? '1.5px solid #10B981' : '1px solid var(--border-color)',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '20px',
            transition: 'all 0.2s ease',
            opacity: hasScrolledToBottom ? 1 : 0.6
          }}>
            <input
              type="checkbox"
              id="terms-checkbox"
              disabled={!hasScrolledToBottom}
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                accentColor: 'var(--primary)',
                cursor: hasScrolledToBottom ? 'pointer' : 'not-allowed'
              }}
            />
            <label
              htmlFor="terms-checkbox"
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-primary)',
                fontWeight: 600,
                cursor: hasScrolledToBottom ? 'pointer' : 'not-allowed',
                userSelect: 'none'
              }}
            >
              I read and agree to Connecta's Terms & Conditions and Privacy Policy.
            </label>
          </div>

          {/* Accept & Enter Dashboard Button */}
          <button
            type="button"
            onClick={handleAccept}
            disabled={!hasScrolledToBottom || !agreed || accepting}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '0.98rem',
              opacity: (!hasScrolledToBottom || !agreed || accepting) ? 0.5 : 1,
              cursor: (!hasScrolledToBottom || !agreed || accepting) ? 'not-allowed' : 'pointer'
            }}
          >
            {accepting ? 'Activating...' : 'Accept & Activate Account'} <ArrowRight size={18} />
          </button>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};
