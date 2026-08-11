import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Users, 
  Briefcase, 
  Clock, 
  Rocket, 
  Check, 
  ArrowRight 
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export interface HiringGoalOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const HIRING_GOALS: HiringGoalOption[] = [
  {
    id: 'one_off_project',
    title: 'One-Time Project Contract',
    description: 'Build a website, design a logo, fix bugs, or complete a specific deliverable.',
    icon: <Briefcase size={22} />
  },
  {
    id: 'dedicated_freelancer',
    title: 'Dedicated Freelancer (Ongoing)',
    description: 'Long-term hourly or milestone collaboration for recurring monthly tasks.',
    icon: <Clock size={22} />
  },
  {
    id: 'collabo_team',
    title: 'Collabo Team Hiring',
    description: 'Assemble a multi-skilled cross-functional team (Devs, Designers, PMs) for major launches.',
    icon: <Users size={22} />
  },
  {
    id: 'fulltime_hire',
    title: 'Permanent Full-Time Hire',
    description: 'Recruit top African tech & business talent for permanent roles at your company.',
    icon: <Rocket size={22} />
  }
];

export const COMPANY_SIZES = [
  'Solo Entrepreneur / Founder',
  '2 - 10 Employees',
  '11 - 50 Employees',
  '50+ Employees'
];

export const ClientGoalsPage: React.FC = () => {
  const navigate = useNavigate();
  const { error: toastError } = useToast();

  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [selectedCompanySize, setSelectedCompanySize] = useState<string>(COMPANY_SIZES[0]);

  const handleContinue = () => {
    if (!selectedGoal) {
      toastError('Selection Required', 'Please select your primary hiring goal');
      return;
    }

    sessionStorage.setItem('client_hiring_goal', selectedGoal);
    sessionStorage.setItem('client_company_size', selectedCompanySize);

    navigate('/register/client-profile-setup');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Navbar />

      <main style={{
        flex: 1,
        maxWidth: '820px',
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
              <Sparkles size={14} /> Client Onboarding: Step 2 of 3
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
              What is your primary hiring goal?
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              This helps us customize your job posting workspace and AI candidate matching parameters
            </p>
          </div>

          {/* Hiring Goal Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            {HIRING_GOALS.map((goal) => {
              const isSelected = selectedGoal === goal.id;
              return (
                <motion.div
                  key={goal.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedGoal(goal.id)}
                  style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-lg)',
                    background: isSelected ? 'var(--grad-glow)' : 'var(--bg-secondary)',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'var(--transition-fast)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px'
                  }}
                >
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: isSelected ? 'var(--primary)' : 'rgba(253, 103, 48, 0.1)',
                    color: isSelected ? '#ffffff' : 'var(--primary)',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0
                  }}>
                    {goal.icon}
                  </div>

                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>
                      {goal.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      {goal.description}
                    </p>
                  </div>

                  {isSelected && (
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      color: '#fff',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0
                    }}>
                      <Check size={12} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Company Size Picker */}
          <div style={{ marginBottom: '36px' }}>
            <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>
              Company / Team Size *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '10px' }}>
              {COMPANY_SIZES.map((size) => {
                const isSelected = selectedCompanySize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedCompanySize(size)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'var(--grad-glow)' : 'var(--bg-secondary)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Continue Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleContinue}
            disabled={!selectedGoal}
            className="btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: '1rem' }}
          >
            Continue to Profile Details <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};
