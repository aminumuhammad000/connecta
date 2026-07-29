import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Users,
  ShieldCheck,
  Zap,
  CheckCircle,
  Star,
  Sparkles,
  Search
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Navbar />

      {/* Background Animated Glow Orbs */}
      <div className="bg-glow-orb bg-glow-orange" style={{ top: '-100px', left: '-100px' }} />
      <div className="bg-glow-orb bg-glow-coral" style={{ top: '300px', right: '-50px' }} />

      {/* HERO SECTION */}
      <section style={{
        padding: '80px 24px 100px',
        maxWidth: '1280px',
        margin: '0 auto',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '60px',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--success-bg)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: 'var(--success)',
            fontWeight: 600,
            fontSize: '0.85rem',
            marginBottom: '24px'
          }}>
            <Sparkles size={16} /> Africa's Premier Talent Marketplace
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: '-1px',
            marginBottom: '24px'
          }}>
            Hire Verified Experts. <br />
            <span className="gradient-text">Build Great Things.</span>
          </h1>

          <p style={{
            fontSize: '1.2rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '36px',
            maxWidth: '560px'
          }}>
            Connecta seamlessly pairs visionaries with vetted African freelancers and top-tier talent. Secure payments, real-time collaboration, and guaranteed satisfaction.
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '48px' }}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/register/role')}
              className="btn-primary"
              style={{ padding: '16px 32px', fontSize: '1.05rem' }}
            >
              Get Started Now <ArrowRight size={20} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/jobs')}
              className="btn-secondary"
              style={{ padding: '16px 28px', fontSize: '1.05rem' }}
            >
              <Search size={18} style={{ marginRight: '4px' }} /> Explore Jobs
            </motion.button>
          </div>

          {/* Trust Metrics */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
            paddingTop: '24px',
            borderTop: '1px solid var(--border-color)'
          }}>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>10k+</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Vetted Freelancers</div>
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>₦500M+</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Earned by Talent</div>
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>99.4%</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Job Success Rate</div>
            </div>
          </div>
        </motion.div>

        {/* Hero Interactive Glass Showcase Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card"
          style={{
            padding: '32px',
            position: 'relative',
            background: 'var(--card-glass)',
            boxShadow: 'var(--shadow-glow)'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--grad-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700
              }}>
                KA
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>Kabiru Abubakar</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>Senior React & Mobile Engineer</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F59E0B', fontWeight: 700, fontSize: '0.9rem' }}>
              <Star size={16} fill="#F59E0B" /> 5.0 (42 reviews)
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Top Skills</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['React.js', 'React Native', 'Node.js', 'TypeScript', 'Tailwind'].map((skill) => (
                <span key={skill} style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.8rem',
                  fontWeight: 500
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hourly Rate</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>₦15,000 / hr</div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--success)',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}>
              <CheckCircle size={16} /> Verified Badge
            </div>
          </div>

          <button
            onClick={() => navigate('/register/role')}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)' }}
          >
            Hire Talent Like Kabiru
          </button>
        </motion.div>
      </section>

      {/* WHY CHOOSE CONNECTA */}
      <section style={{
        padding: '80px 24px',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '16px' }}>
            Built for Modern African Work
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 60px' }}>
            Whether you need a quick landing page or a full enterprise mobile app, Connecta provides the tools to succeed.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px'
          }}>
            {[
              {
                icon: <ShieldCheck size={32} color="var(--primary)" />,
                title: 'Escrow Protection',
                desc: 'Client funds are safely held in escrow and released only when project deliverables are approved.'
              },
              {
                icon: <Zap size={32} color="var(--primary)" />,
                title: 'AI Smart Matching',
                desc: 'Our intelligent system matches job requirements with talent skills instantly for maximum fit.'
              },
              {
                icon: <Users size={32} color="var(--primary)" />,
                title: 'Vetted Talent Pool',
                desc: 'Freelancers go through skill checks and identity verification before accepting contracts.'
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -6 }}
                className="glass-card"
                style={{ padding: '36px 28px', textAlign: 'left' }}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  background: 'var(--grad-glow)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px' }}>{feature.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
