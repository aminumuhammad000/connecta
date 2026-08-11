import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Users, 
  Target, 
  Briefcase, 
  TrendingUp, 
  Sparkles, 
  Check, 
  ArrowRight 
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export interface ClientIndustryOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

export const CLIENT_INDUSTRIES: ClientIndustryOption[] = [
  {
    id: 'tech_startup',
    name: 'Technology & Startups',
    description: 'SaaS, mobile apps, AI products, fintech, web applications & dev teams.',
    icon: <Building2 size={24} />
  },
  {
    id: 'ecommerce_retail',
    name: 'E-Commerce & Retail',
    description: 'Online stores, Shopify, digital marketing, product photography & logistics.',
    icon: <TrendingUp size={24} />
  },
  {
    id: 'agency_consulting',
    name: 'Agencies & Consulting',
    description: 'Digital agencies, creative studios, marketing firms & business advisory.',
    icon: <Briefcase size={24} />
  },
  {
    id: 'sme_corporate',
    name: 'Corporate & Small Business',
    description: 'Established enterprises, local businesses, law firms, real estate & healthcare.',
    icon: <Users size={24} />
  },
  {
    id: 'nonprofit_edu',
    name: 'Non-Profit & Education',
    description: 'NGOs, schools, e-learning platforms, research & community organizations.',
    icon: <Target size={24} />
  }
];

export const ClientIndustryPage: React.FC = () => {
  const navigate = useNavigate();
  const { error: toastError } = useToast();
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [customIndustry, setCustomIndustry] = useState<string>('');

  const handleContinue = () => {
    if (!selectedIndustry) {
      toastError('Selection Required', 'Please choose your primary industry to continue');
      return;
    }
    const finalIndustry = selectedIndustry === 'other' ? customIndustry.trim() : selectedIndustry;
    if (selectedIndustry === 'other' && !finalIndustry) {
      toastError('Specify Industry', 'Please enter your custom industry name');
      return;
    }

    sessionStorage.setItem('client_industry', finalIndustry);
    navigate(`/register/client-goals?industry=${encodeURIComponent(finalIndustry)}`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Navbar />

      <main style={{
        flex: 1,
        maxWidth: '860px',
        margin: '0 auto',
        padding: '50px 24px 80px',
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
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--grad-glow)',
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: '0.8rem',
              marginBottom: '12px'
            }}>
              <Sparkles size={14} /> Client Onboarding: Step 1 of 3
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
              What is your company or project sector?
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Tell us your industry so we can match you with top-rated talent specialized in your domain
            </p>
          </div>

          {/* Industry Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {CLIENT_INDUSTRIES.map((ind) => {
              const isSelected = selectedIndustry === ind.id;
              return (
                <motion.div
                  key={ind.id}
                  whileHover={{ scale: 1.02, translateY: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedIndustry(ind.id)}
                  style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-lg)',
                    background: isSelected ? 'var(--grad-glow)' : 'var(--bg-secondary)',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'var(--transition-fast)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: isSelected ? 'var(--primary)' : 'rgba(253, 103, 48, 0.1)',
                      color: isSelected ? '#ffffff' : 'var(--primary)',
                      display: 'grid',
                      placeItems: 'center',
                      marginBottom: '14px'
                    }}>
                      {ind.icon}
                    </div>

                    <h3 style={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      marginBottom: '6px',
                      color: 'var(--text-primary)'
                    }}>
                      {ind.name}
                    </h3>

                    <p style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.45
                    }}>
                      {ind.description}
                    </p>
                  </div>

                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      color: '#fff',
                      display: 'grid',
                      placeItems: 'center'
                    }}>
                      <Check size={14} />
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* Other Industry Option */}
            <motion.div
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedIndustry('other')}
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-lg)',
                background: selectedIndustry === 'other' ? 'var(--grad-glow)' : 'var(--bg-secondary)',
                border: selectedIndustry === 'other' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                cursor: 'pointer',
                position: 'relative',
                transition: 'var(--transition-fast)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: selectedIndustry === 'other' ? 'var(--primary)' : 'rgba(253, 103, 48, 0.1)',
                  color: selectedIndustry === 'other' ? '#ffffff' : 'var(--primary)',
                  display: 'grid',
                  placeItems: 'center',
                  marginBottom: '14px'
                }}>
                  <Sparkles size={24} />
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Other Industry
                </h3>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  Enter your organization's custom field manually if not listed above.
                </p>
              </div>

              {selectedIndustry === 'other' && (
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: '#fff',
                  display: 'grid',
                  placeItems: 'center'
                }}>
                  <Check size={14} />
                </div>
              )}
            </motion.div>
          </div>

          {/* Custom Industry Input */}
          {selectedIndustry === 'other' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{ marginBottom: '28px' }}
            >
              <div className="form-group">
                <label className="form-label">Specify Your Industry *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Real Estate Construction, Agriculture, Solar Energy..."
                  value={customIndustry}
                  onChange={(e) => setCustomIndustry(e.target.value)}
                  className="input-field no-icon"
                />
              </div>
            </motion.div>
          )}

          {/* Continue Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleContinue}
            disabled={!selectedIndustry || (selectedIndustry === 'other' && !customIndustry.trim())}
            className="btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: '1rem' }}
          >
            Continue to Hiring Needs <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};
