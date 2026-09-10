import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, UserCheck, ArrowRight, Sparkles } from 'lucide-react';
import { Logo } from './Logo';

interface RoleSwitchLoaderProps {
  isVisible: boolean;
  fromRole: 'client' | 'freelancer';
  toRole: 'client' | 'freelancer';
}

export const RoleSwitchLoader: React.FC<RoleSwitchLoaderProps> = ({
  isVisible,
  fromRole,
  toRole,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'var(--bg-primary, #0d0e15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Ambient Artwork Glow */}
          <div
            style={{
              position: 'absolute',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(253,103,48,0.15) 0%, rgba(0,0,0,0) 70%)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              filter: 'blur(40px)',
            }}
          />

          <motion.div
            initial={{ scale: 0.9, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              maxWidth: '420px',
              width: '100%',
              textAlign: 'center',
              position: 'relative',
              zIndex: 10,
            }}
          >
            {/* Logo */}
            <div style={{ marginBottom: '32px' }}>
              <Logo height={42} />
            </div>

            {/* Role Transition Card */}
            <div
              className="glass-card"
              style={{
                width: '100%',
                padding: '32px 28px',
                borderRadius: '24px',
                border: '1px solid var(--border-color, rgba(255,255,255,0.12))',
                background: 'var(--card-bg, rgba(20,22,32,0.85))',
                boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '24px',
                }}
              >
                {/* From Role Badge */}
                <motion.div
                  animate={{ scale: [1, 0.95, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '16px',
                      background: 'var(--bg-secondary, rgba(255,255,255,0.06))',
                      border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-muted, #94a3b8)',
                    }}
                  >
                    {fromRole === 'client' ? <UserCheck size={24} /> : <Briefcase size={24} />}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {fromRole === 'client' ? 'Client' : 'Freelancer'}
                  </span>
                </motion.div>

                {/* Animated Transition Arrow */}
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--primary)' }}>
                  <motion.div
                    animate={{ x: [0, 6, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                  >
                    <ArrowRight size={22} />
                  </motion.div>
                </div>

                {/* To Role Badge (Target Role) */}
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 1.8 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '16px',
                      background: 'var(--grad-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      boxShadow: '0 8px 20px rgba(253,103,48,0.35)',
                    }}
                  >
                    {toRole === 'client' ? <UserCheck size={26} /> : <Briefcase size={26} />}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {toRole === 'client' ? 'Client Mode' : 'Freelancer Mode'}
                  </span>
                </motion.div>
              </div>

              {/* Status Message */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '4px', color: 'var(--text-primary)' }}>
                  Switching Workspace
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Preparing your {toRole === 'client' ? 'Client Management' : 'Freelancer Work'} dashboard...
                </p>
              </div>

              {/* Minimalist Progress Bar */}
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  borderRadius: '10px',
                  background: 'var(--bg-tertiary, rgba(255,255,255,0.08))',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.2, ease: 'easeInOut' }}
                  style={{
                    height: '100%',
                    background: 'var(--grad-primary)',
                    borderRadius: '10px',
                    boxShadow: '0 0 12px rgba(253,103,48,0.6)',
                  }}
                />
              </div>

              {/* Bottom Tagline */}
              <div
                style={{
                  marginTop: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                }}
              >
                <Sparkles size={14} color="var(--primary)" />
                <span>Seamless Account Switching</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
