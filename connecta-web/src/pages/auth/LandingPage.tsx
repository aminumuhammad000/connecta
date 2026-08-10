import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Star,
  Sparkles,
  Search,
  UserCheck,
  TrendingUp,
  Award,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { DashboardHeaderArt } from '../../components/common/DashboardHeaderArt';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflowX: 'hidden' }}>
      <Navbar />

      {/* ── HERO SECTION ── */}
      <section style={{
        padding: '60px 24px 80px',
        maxWidth: '1360px',
        margin: '0 auto',
        width: '100%',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Top Hero Banner Matching Modern Dashboard Theme */}
        <motion.div
          className="dashboard-hero-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'var(--grad-primary)',
            borderRadius: '24px',
            padding: '40px 48px',
            color: '#ffffff',
            marginBottom: '40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 12px 35px rgba(253,103,48,0.22)',
          }}
        >
          {/* Background Vector Art Overlay */}
          <div style={{
            position: 'absolute',
            right: '-10px',
            top: '-20px',
            bottom: '-20px',
            width: '400px',
            opacity: 0.22,
            pointerEvents: 'none',
            zIndex: 1,
          }}>
            <DashboardHeaderArt />
          </div>

          <div style={{ position: 'relative', zIndex: 2, maxWidth: '680px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              padding: '5px 14px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              marginBottom: '14px',
              textTransform: 'uppercase',
            }}>
              <Sparkles size={14} /> Africa's Premier Talent Marketplace
            </div>

            <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)', fontWeight: 900, margin: '0 0 12px', color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
              Connecting African Talent with Global Opportunities
            </h1>
            <p style={{ opacity: 0.95, fontSize: '1.05rem', lineHeight: 1.55, margin: '0 0 28px', maxWidth: '580px' }}>
              Connecta seamlessly pairs tech visionaries with vetted freelancers. Instant smart matching, 100% Paystack escrow protection, and real-time chat.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/register/role')}
                style={{
                  background: '#ffffff',
                  color: 'var(--primary)',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: '14px',
                  fontWeight: 800,
                  fontSize: '0.98rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
                }}
              >
                Get Started Now <ArrowRight size={18} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/jobs')}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  padding: '14px 24px',
                  borderRadius: '14px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Search size={16} /> Explore Open Jobs
              </motion.button>
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '240px' }} className="desktop-sidebar">
            <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', padding: '14px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.25)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>10,000+</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Vetted African Talent</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', padding: '14px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.25)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>₦500M+</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Secure Escrow Payments</div>
            </div>
          </div>
        </motion.div>

        {/* ── 2. METRIC STATS ROW (Matching Dashboard Layout) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          <motion.div
            whileHover={{ y: -3 }}
            className="glass-card"
            style={{ padding: '20px 24px', borderRadius: '18px', border: '1px solid var(--border-color)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Talent Pool</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(253,103,48,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserCheck size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>10k+ Experts</div>
            <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <TrendingUp size={13} /> Vetted & Skill-Tested
            </span>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="glass-card"
            style={{ padding: '20px 24px', borderRadius: '18px', border: '1px solid var(--border-color)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Escrow Security</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>100% Protected</div>
            <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <Lock size={13} /> Milestone Release
            </span>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="glass-card"
            style={{ padding: '20px 24px', borderRadius: '18px', border: '1px solid var(--border-color)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Project Success</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59,130,246,0.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>99.4% Rating</div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Verified Client Reviews</span>
          </motion.div>
        </div>

        {/* ── 3. FEATURED HIGHLIGHT CARDS GRID ── */}
        <div className="grid-responsive-2" style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '28px', marginBottom: '40px' }}>
          
          {/* Left Column: How Connecta Works */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Why Top Visionaries Choose Connecta
              </h2>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '4px 12px', borderRadius: '8px', background: 'rgba(253,103,48,0.1)', color: 'var(--primary)' }}>
                African Platform
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--bg-tertiary)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800 }}>
                  01
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>Post a Project or Discover Gigs</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    Define contract scopes, specify tech stacks, or search live freelance job postings with fixed or hourly rates.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--bg-tertiary)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800 }}>
                  02
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>AI Copilot & Vetted Proposals</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    Receive pitch proposals from vetted engineers. Use built-in AI Copilot to refine requirements and benchmark pricing.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--bg-tertiary)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800 }}>
                  03
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>Paystack Escrow & Real-Time Messaging</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    Hire talent, deposit funds into milestone Escrow, and collaborate via direct Socket.io chat until project signoff.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Featured Talent Showcase Card */}
          <div className="glass-card" style={{ padding: '28px', borderRadius: '24px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                  alt="Featured Freelancer"
                  style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Usman Umar <CheckCircle2 size={15} color="var(--primary)" />
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>Senior Full-Stack Engineer</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F59E0B', fontWeight: 700, fontSize: '0.88rem', marginBottom: '14px' }}>
                <Star size={15} fill="#F59E0B" /> 5.0 (38 delivered projects)
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '18px' }}>
                "Connecta allows me to collaborate with international clients securely with guaranteed milestone Escrow payouts."
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                {['React.js', 'React Native', 'Node.js', 'TypeScript'].map((skill) => (
                  <span key={skill} style={{ fontSize: '0.72rem', fontWeight: 600, padding: '3px 9px', borderRadius: '6px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate('/register/role')}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '0.88rem' }}
            >
              Join Connecta Platform <ArrowUpRight size={16} />
            </button>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};
