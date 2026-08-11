import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, ScrollText } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import confetti from 'canvas-confetti';

export const TermsAndConditionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [agreed, setAgreed] = useState(false);
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

  const handleAccept = () => {
    if (!hasScrolledToBottom) {
      error('Scroll Required', 'Please scroll down and read the terms before accepting');
      return;
    }
    if (!agreed) {
      error('Agreement Required', 'Please check the box to accept the Terms and Conditions');
      return;
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
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 24px 80px',
        width: '100%',
        position: 'relative',
        zIndex: 10
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{ padding: '40px 32px' }}
        >
          {/* Top Badge & Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--grad-glow)',
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              marginBottom: '12px'
            }}>
              <ShieldCheck size={16} /> Final Step: Legal & Platform Terms
            </div>

            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
              Connecta Terms & Conditions
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '580px', margin: '0 auto' }}>
              Please scroll down and read our terms of service to complete your registration and activate your workspace.
            </p>
          </div>

          {/* Scroll Progress Indicator Callout */}
          {!hasScrolledToBottom && (
            <div style={{
              background: 'rgba(253, 103, 48, 0.08)',
              border: '1px solid rgba(253, 103, 48, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
              color: 'var(--primary)'
            }}>
              <ScrollText size={20} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                Scroll to the bottom of the document below to unlock acceptance
              </span>
            </div>
          )}

          {/* Terms Content Scroll Box */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            style={{
              maxHeight: '380px',
              overflowY: 'auto',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              fontSize: '0.9rem',
              lineHeight: 1.7,
              color: 'var(--text-secondary)',
              marginBottom: '28px',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.05)'
            }}
          >
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>
              1. Acceptance of Terms
            </h3>
            <p style={{ marginBottom: '16px' }}>
              By creating an account on Connecta, accessing our services, or interacting with freelancers or clients on the platform, you agree to be bound by these Terms and Conditions. If you do not agree to all terms, you may not access or use Connecta.
            </p>

            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>
              2. User Accounts & Verification
            </h3>
            <p style={{ marginBottom: '16px' }}>
              Users must provide accurate, complete registration information. You are responsible for safeguarding your credentials. Connecta reserves the right to verify user identities, sectors, and currencies to maintain platform trust.
            </p>

            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>
              3. Payments, Escrow & Work Protection
            </h3>
            <p style={{ marginBottom: '16px' }}>
              All client payments are held securely in escrow until milestone deliverables are reviewed and approved. Connecta supports multiple African and global currencies (USD, NGN, GHS, KES, ZAR). Direct off-platform payments are strictly prohibited and may result in account termination.
            </p>

            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>
              4. Code of Conduct & Fair Play
            </h3>
            <p style={{ marginBottom: '16px' }}>
              Freelancers and clients agree to maintain respectful, professional communication. Spam, abusive language, copyright infringement, and unauthorized data scraping are grounds for immediate suspension.
            </p>

            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>
              5. Intellectual Property Rights
            </h3>
            <p style={{ marginBottom: '16px' }}>
              Upon full escrow milestone payout, all intellectual property rights for custom deliverables transfer from the freelancer to the client, unless explicitly stated otherwise in project contracts.
            </p>

            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>
              6. Limitation of Liability
            </h3>
            <p style={{ marginBottom: '0' }}>
              Connecta acts as a marketplace facilitator. While we enforce verification and escrow protection, Connecta is not liable for indirect damages or external contractual disputes beyond our managed escrow resolution protocols.
            </p>
          </div>

          {/* Checkbox Agreement Area */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            background: agreed ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-secondary)',
            border: agreed ? '1px solid #10B981' : '1px solid var(--border-color)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '28px',
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
                width: '20px',
                height: '20px',
                accentColor: 'var(--primary)',
                cursor: hasScrolledToBottom ? 'pointer' : 'not-allowed',
                marginTop: '2px'
              }}
            />
            <label
              htmlFor="terms-checkbox"
              style={{
                fontSize: '0.92rem',
                color: 'var(--text-primary)',
                fontWeight: 600,
                cursor: hasScrolledToBottom ? 'pointer' : 'not-allowed',
                userSelect: 'none'
              }}
            >
              I have read, understood, and agree to Connecta's Terms & Conditions and Privacy Policy.
            </label>
          </div>

          {/* Accept & Enter Dashboard Button */}
          <button
            type="button"
            onClick={handleAccept}
            disabled={!hasScrolledToBottom || !agreed}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 'var(--radius-lg)',
              fontSize: '1.05rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              opacity: (!hasScrolledToBottom || !agreed) ? 0.5 : 1,
              cursor: (!hasScrolledToBottom || !agreed) ? 'not-allowed' : 'pointer'
            }}
          >
            Accept & Continue to Dashboard <ArrowRight size={20} />
          </button>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};
