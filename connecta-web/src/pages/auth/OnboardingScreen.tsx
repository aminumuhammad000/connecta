import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  ChevronRight,
  ChevronLeft,
  Users,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { storage } from '../../utils/storage';
import { Logo } from '../../components/common/Logo';
import { PageArtwork } from '../../components/common/PageArtwork';

interface OnboardingSlide {
  id: number;
  badge: string;
  title: string;
  highlight: string;
  description: string;
  icon: React.ReactNode;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: 1,
    badge: 'Verified African Talent',
    title: 'Discover Top Tech Talent',
    highlight: 'Connect & Hire Experts',
    description: 'Hire vetted African freelancers across Software Development, Design, Data, and Marketing.',
    icon: <Users size={40} color="var(--primary)" />
  },
  {
    id: 2,
    badge: '100% Escrow Protection',
    title: 'Safe Milestone Payouts',
    highlight: 'Guaranteed Protection',
    description: 'Funds are securely held in escrow and released only when work is completed to your satisfaction.',
    icon: <ShieldCheck size={40} color="var(--primary)" />
  },
  {
    id: 3,
    badge: 'Seamless Collaboration',
    title: 'Real-time Workspaces',
    highlight: 'Build Together Faster',
    description: 'Chat in real-time, share files, track milestones, and manage project progress effortlessly.',
    icon: <Zap size={40} color="var(--primary)" />
  }
];

export const OnboardingScreen: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // If logged in, redirect straight to dashboard
    if (isAuthenticated && user) {
      if (user.userType === 'client') {
        navigate('/client/dashboard', { replace: true });
      } else {
        navigate('/freelancer/dashboard', { replace: true });
      }
      return;
    }

    // If user has already completed/seen onboarding before, skip directly to role selection / signup
    if (storage.hasSeenOnboarding()) {
      navigate('/register/role', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleFinishOnboarding = () => {
    storage.setHasSeenOnboarding(true);
    navigate('/register/role');
  };

  const nextSlide = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleFinishOnboarding();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = SLIDES[currentSlide];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden',
      padding: '24px',
      background: 'var(--bg-primary)'
    }}>
      <PageArtwork />

      {/* Top Header Bar */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <Logo height={38} />
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={toggleTheme}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {isDark ? <Sun size={18} color="#F59E0B" /> : <Moon size={18} color="#4B5563" />}
          </button>

          <Link to="/login" style={{
            fontWeight: 600,
            fontSize: '0.88rem',
            color: 'var(--primary)',
            padding: '8px 20px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            textDecoration: 'none'
          }}>
            Sign In
          </Link>
        </div>
      </div>

      {/* Centered Minimalist Onboarding Card */}
      <main style={{
        maxWidth: '480px',
        margin: 'auto',
        width: '100%',
        position: 'relative',
        zIndex: 10,
        padding: '30px 0'
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 15, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="glass-card"
            style={{
              padding: '40px 32px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            {/* Clean Icon Badge */}
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: 'var(--grad-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              border: '1px solid var(--card-border)'
            }}>
              {slide.icon}
            </div>

            {/* Sub-badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: '0.78rem',
              marginBottom: '14px'
            }}>
              <Sparkles size={12} /> {slide.badge}
            </div>

            {/* Headline */}
            <h1 style={{ fontSize: '1.7rem', fontWeight: 900, marginBottom: '4px', lineHeight: 1.25, color: 'var(--text-primary)' }}>
              {slide.title}
            </h1>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px' }} className="gradient-text">
              {slide.highlight}
            </h2>

            {/* Short Description */}
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.55, maxWidth: '380px', marginBottom: '28px' }}>
              {slide.description}
            </p>

            {/* Step Progress Dots */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
              {SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentSlide(idx)}
                  style={{
                    width: currentSlide === idx ? '26px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: currentSlide === idx ? 'var(--primary)' : 'var(--border-color)',
                    transition: 'var(--transition-fast)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              {currentSlide > 0 && (
                <button
                  onClick={prevSlide}
                  className="btn-secondary"
                  style={{ padding: '13px', borderRadius: 'var(--radius-md)' }}
                >
                  <ChevronLeft size={20} />
                </button>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={nextSlide}
                className="btn-primary"
                style={{ flex: 1, padding: '14px', fontSize: '0.98rem' }}
              >
                {currentSlide === SLIDES.length - 1 ? (
                  <>Get Started <ArrowRight size={18} /></>
                ) : (
                  <>Next <ChevronRight size={18} /></>
                )}
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Skip Link */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            onClick={handleFinishOnboarding}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Skip Intro & Choose Role ➔
          </button>
        </div>
      </main>

      <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', position: 'relative', zIndex: 10 }}>
        © {new Date().getFullYear()} Connecta
      </div>
    </div>
  );
};
