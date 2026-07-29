import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { motion } from 'framer-motion';
import { ArrowRight, UserCheck, Briefcase, CheckCircle2 } from 'lucide-react';
import { useRole } from '../../contexts/RoleContext';

/* ─── Inline SVG: Client / Hiring illustration ─── */
const ClientArt = () => (
  <svg viewBox="0 0 340 340" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    {/* Handshake */}
    <path d="M80 180 C100 160 130 155 155 170 L190 190 C210 200 235 195 250 178" stroke="#FD6730" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M250 178 C265 162 260 140 245 132 L210 118" stroke="#FD6730" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M80 180 C65 195 68 218 85 228 L120 242" stroke="#FD6730" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Person left */}
    <circle cx="60" cy="115" r="22" stroke="#FD6730" strokeWidth="2"/>
    <path d="M38 155 C38 135 82 135 82 155 L82 200" stroke="#FD6730" strokeWidth="2" strokeLinecap="round"/>
    <path d="M82 175 L110 185" stroke="#FD6730" strokeWidth="2" strokeLinecap="round"/>
    <path d="M38 175 L18 185" stroke="#FD6730" strokeWidth="2" strokeLinecap="round"/>
    {/* Person right */}
    <circle cx="280" cy="105" r="22" stroke="#FD6730" strokeWidth="2"/>
    <path d="M258 145 C258 125 302 125 302 145 L302 195" stroke="#FD6730" strokeWidth="2" strokeLinecap="round"/>
    <path d="M258 165 L230 178" stroke="#FD6730" strokeWidth="2" strokeLinecap="round"/>
    <path d="M302 165 L320 178" stroke="#FD6730" strokeWidth="2" strokeLinecap="round"/>
    {/* Briefcase / document */}
    <rect x="230" y="50" width="60" height="45" rx="6" stroke="#FD6730" strokeWidth="2"/>
    <path d="M244 50 L244 44 C244 41 248 38 252 38 L268 38 C272 38 276 41 276 44 L276 50" stroke="#FD6730" strokeWidth="2"/>
    <path d="M230 65 L290 65" stroke="#FD6730" strokeWidth="1.5" strokeDasharray="4 3"/>
    {/* Growth arrow */}
    <path d="M30 260 L80 220 L130 240 L200 190 L260 210 L310 165" stroke="#FD6730" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M300 155 L310 165 L300 175" stroke="#FD6730" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Stars / sparkles */}
    <path d="M170 60 L173 70 L183 73 L173 76 L170 86 L167 76 L157 73 L167 70 Z" stroke="#FD6730" strokeWidth="1.5" fill="rgba(253,103,48,0.15)"/>
    <path d="M310 230 L312 237 L319 239 L312 241 L310 248 L308 241 L301 239 L308 237 Z" stroke="#FD6730" strokeWidth="1.5" fill="rgba(253,103,48,0.15)"/>
    {/* Dotted connecting lines */}
    <path d="M155 90 C155 90 160 115 160 130" stroke="#FD6730" strokeWidth="1.5" strokeDasharray="3 4" strokeLinecap="round"/>
    <circle cx="155" cy="88" r="4" fill="#FD6730" opacity="0.6"/>
  </svg>
);

/* ─── Inline SVG: Freelancer / Work illustration ─── */
const FreelancerArt = () => (
  <svg viewBox="0 0 340 340" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    {/* Laptop */}
    <rect x="80" y="140" width="180" height="115" rx="10" stroke="#FD6730" strokeWidth="2.5"/>
    <path d="M50 255 L290 255 C295 255 298 260 298 265 L298 270 L42 270 L42 265 C42 260 45 255 50 255Z" stroke="#FD6730" strokeWidth="2"/>
    <rect x="94" y="153" width="152" height="90" rx="4" stroke="#FD6730" strokeWidth="1.5"/>
    {/* Screen content lines */}
    <path d="M106 170 L180 170" stroke="#FD6730" strokeWidth="2" strokeLinecap="round"/>
    <path d="M106 182 L165 182" stroke="#FD6730" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 3"/>
    <path d="M106 194 L155 194" stroke="#FD6730" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 3"/>
    {/* Code brackets on screen */}
    <path d="M195 172 L205 183 L195 194" stroke="#FD6730" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M215 172 L225 183 L215 194" stroke="#FD6730" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Person sitting */}
    <circle cx="170" cy="88" r="26" stroke="#FD6730" strokeWidth="2.2"/>
    <path d="M144 125 C144 108 196 108 196 125 L196 148" stroke="#FD6730" strokeWidth="2" strokeLinecap="round"/>
    <path d="M144 130 L120 138" stroke="#FD6730" strokeWidth="2" strokeLinecap="round"/>
    <path d="M196 130 L218 138" stroke="#FD6730" strokeWidth="2" strokeLinecap="round"/>
    {/* Lightbulb */}
    <circle cx="290" cy="75" r="20" stroke="#FD6730" strokeWidth="2"/>
    <path d="M284 88 L284 98 L296 98 L296 88" stroke="#FD6730" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M286 98 L294 98" stroke="#FD6730" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M290 55 L290 48" stroke="#FD6730" strokeWidth="2" strokeLinecap="round"/>
    <path d="M306 60 L311 55" stroke="#FD6730" strokeWidth="2" strokeLinecap="round"/>
    <path d="M274 60 L269 55" stroke="#FD6730" strokeWidth="2" strokeLinecap="round"/>
    {/* Paintbrush / pen */}
    <path d="M45 80 L75 110" stroke="#FD6730" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M45 80 L55 70 L65 80 L55 90 Z" stroke="#FD6730" strokeWidth="2" fill="rgba(253,103,48,0.2)"/>
    <circle cx="75" cy="113" r="5" stroke="#FD6730" strokeWidth="2" fill="rgba(253,103,48,0.3)"/>
    {/* Coffee cup */}
    <path d="M40 255 L40 235 C40 232 43 230 46 230 L66 230 C69 230 72 232 72 235 L72 255" stroke="#FD6730" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M72 238 L80 238 C83 238 85 241 83 244 L80 247 L72 247" stroke="#FD6730" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M50 222 C50 218 54 215 54 211" stroke="#FD6730" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2"/>
    <path d="M57 222 C57 218 61 215 61 211" stroke="#FD6730" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2"/>
    {/* Stars */}
    <path d="M115 55 L117 62 L124 64 L117 66 L115 73 L113 66 L106 64 L113 62 Z" stroke="#FD6730" strokeWidth="1.5" fill="rgba(253,103,48,0.15)"/>
    <path d="M245 48 L247 54 L253 56 L247 58 L245 64 L243 58 L237 56 L243 54 Z" stroke="#FD6730" strokeWidth="1.5" fill="rgba(253,103,48,0.12)"/>
    {/* Orbital dots */}
    <circle cx="310" cy="170" r="4" fill="#FD6730" opacity="0.5"/>
    <circle cx="30" cy="195" r="3" fill="#FD6730" opacity="0.4"/>
    <circle cx="290" cy="280" r="5" fill="#FD6730" opacity="0.3"/>
  </svg>
);

export const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { setRole } = useRole();
  const [selectedRole, setSelectedRole] = useState<'client' | 'freelancer' | null>(null);

  const handleContinue = () => {
    if (!selectedRole) return;
    setRole(selectedRole);
    navigate(`/register?role=${selectedRole}`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>

      {/* ── Left Background Art: Client ── */}
      <motion.div
        animate={{
          opacity: selectedRole === 'client' ? 1 : selectedRole === 'freelancer' ? 0.25 : 0.55,
          scale: selectedRole === 'client' ? 1.06 : 1,
          x: selectedRole === 'client' ? 14 : 0,
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          left: '-2vw',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '340px',
          height: '340px',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <ClientArt />
      </motion.div>

      {/* ── Right Background Art: Freelancer ── */}
      <motion.div
        animate={{
          opacity: selectedRole === 'freelancer' ? 1 : selectedRole === 'client' ? 0.25 : 0.55,
          scale: selectedRole === 'freelancer' ? 1.06 : 1,
          x: selectedRole === 'freelancer' ? -14 : 0,
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          right: '-2vw',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '340px',
          height: '340px',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <FreelancerArt />
      </motion.div>

      <Navbar />

      <main style={{
        flex: 1,
        maxWidth: '520px',
        margin: '0 auto',
        padding: '50px 24px 60px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 10,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%' }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
              Join Connecta
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              Select your account type to continue
            </p>
          </div>

          {/* Selection Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>

            {/* Client Option */}
            <motion.div
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => setSelectedRole('client')}
              style={{
                padding: '20px 22px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                border: selectedRole === 'client' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                background: selectedRole === 'client' ? 'rgba(253,103,48,0.06)' : 'var(--card-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                boxShadow: selectedRole === 'client' ? '0 0 0 4px rgba(253,103,48,0.1)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '46px', height: '46px', borderRadius: '12px',
                  background: selectedRole === 'client' ? 'var(--grad-primary)' : 'var(--bg-secondary)',
                  color: selectedRole === 'client' ? '#fff' : 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.25s ease',
                }}>
                  <UserCheck size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>I'm a Client</div>
                  <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Hire talent and manage projects</div>
                </div>
              </div>
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%',
                border: selectedRole === 'client' ? 'none' : '2px solid var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}>
                {selectedRole === 'client' && <CheckCircle2 size={22} fill="var(--primary)" color="#fff" />}
              </div>
            </motion.div>

            {/* Freelancer Option */}
            <motion.div
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => setSelectedRole('freelancer')}
              style={{
                padding: '20px 22px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                border: selectedRole === 'freelancer' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                background: selectedRole === 'freelancer' ? 'rgba(253,103,48,0.06)' : 'var(--card-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                boxShadow: selectedRole === 'freelancer' ? '0 0 0 4px rgba(253,103,48,0.1)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '46px', height: '46px', borderRadius: '12px',
                  background: selectedRole === 'freelancer' ? 'var(--grad-primary)' : 'var(--bg-secondary)',
                  color: selectedRole === 'freelancer' ? '#fff' : 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.25s ease',
                }}>
                  <Briefcase size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>I'm a Freelancer</div>
                  <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Find work and earn securely</div>
                </div>
              </div>
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%',
                border: selectedRole === 'freelancer' ? 'none' : '2px solid var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}>
                {selectedRole === 'freelancer' && <CheckCircle2 size={22} fill="var(--primary)" color="#fff" />}
              </div>
            </motion.div>
          </div>

          {/* Continue Button */}
          <motion.button
            whileHover={{ scale: selectedRole ? 1.02 : 1 }}
            whileTap={{ scale: selectedRole ? 0.98 : 1 }}
            disabled={!selectedRole}
            onClick={handleContinue}
            className="btn-primary"
            style={{ width: '100%', padding: '15px', fontSize: '1rem', borderRadius: 'var(--radius-md)' }}
          >
            Continue <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};
