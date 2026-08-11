import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, Zap, Rocket, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../contexts/AuthContext';

const LOADING_STEPS = [
  { label: 'Saving profile preferences...', icon: <Sparkles size={20} /> },
  { label: 'Matching top client projects...', icon: <Zap size={20} /> },
  { label: 'Securing escrow wallet workspace...', icon: <ShieldCheck size={20} /> },
  { label: 'Finalizing account setup...', icon: <Rocket size={20} /> },
];

export const ProfileSetupProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar from 0 to 100% over 3.5 seconds
    const duration = 3500;
    const intervalTime = 50;
    const increment = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    // Cycle through steps
    const step1 = setTimeout(() => setActiveStep(1), 900);
    const step2 = setTimeout(() => setActiveStep(2), 1800);
    const step3 = setTimeout(() => setActiveStep(3), 2700);

    // Trigger celebration confetti & navigate to dashboard at 100%
    const completeTimer = setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#FD6730', '#10B981', '#3B82F6', '#F59E0B']
      });

      setTimeout(() => {
        navigate('/register/terms');
      }, 800);
    }, duration);

    return () => {
      clearInterval(timer);
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      clearTimeout(completeTimer);
    };
  }, [navigate, user]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden',
      padding: '24px'
    }}>
      {/* Background Ambient Glow */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(253,103,48,0.15) 0%, rgba(0,0,0,0) 70%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none'
      }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-card"
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '48px 36px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10,
          borderRadius: 'var(--radius-xl)'
        }}
      >
        {/* Animated Pulsing Ring & Avatar/Icon */}
        <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 28px' }}>
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.6, 0.2, 0.6]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{
              position: 'absolute',
              inset: '-10px',
              borderRadius: '50%',
              background: 'var(--primary)',
              filter: 'blur(12px)',
            }}
          />

          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'var(--grad-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            position: 'relative',
            zIndex: 2,
            boxShadow: 'var(--shadow-glow)',
            fontSize: '2rem',
            fontWeight: 800
          }}>
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt="Profile"
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <Rocket size={44} color="#ffffff" />
            )}
          </div>
        </div>

        {/* Title */}
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
          Setting Up Your Workspace
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '32px' }}>
          Tailoring Connecta for {user?.firstName ? `${user.firstName}` : 'you'}...
        </p>

        {/* Animated Progress Bar */}
        <div style={{
          width: '100%',
          height: '10px',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          marginBottom: '28px',
          border: '1px solid var(--border-color)'
        }}>
          <motion.div
            style={{
              height: '100%',
              background: 'var(--grad-primary)',
              borderRadius: 'var(--radius-full)',
              width: `${progress}%`
            }}
            transition={{ ease: 'linear' }}
          />
        </div>

        {/* Live Step Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
          {LOADING_STEPS.map((step, idx) => {
            const isDone = activeStep > idx;
            const isCurrent = activeStep === idx;
            return (
              <motion.div
                key={step.label}
                animate={{
                  opacity: isDone || isCurrent ? 1 : 0.35,
                  x: isCurrent ? 4 : 0
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isCurrent ? 'rgba(253, 103, 48, 0.08)' : 'transparent',
                  border: isCurrent ? '1px solid rgba(253, 103, 48, 0.2)' : '1px solid transparent'
                }}
              >
                <div style={{
                  color: isDone ? 'var(--success)' : isCurrent ? 'var(--primary)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {isDone ? <CheckCircle2 size={20} color="var(--success)" /> : step.icon}
                </div>
                <span style={{
                  fontSize: '0.9rem',
                  fontWeight: isCurrent || isDone ? 700 : 400,
                  color: isDone ? 'var(--text-primary)' : isCurrent ? 'var(--primary)' : 'var(--text-secondary)'
                }}>
                  {step.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
