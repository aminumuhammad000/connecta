import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { motion } from 'framer-motion';
import { Search, Check, Plus, X, ArrowRight, Sparkles } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const POPULAR_SKILLS = [
  'React.js', 'React Native', 'Node.js', 'TypeScript', 'Python',
  'UI/UX Design', 'Figma', 'Graphic Design', 'Tailwind CSS', 'Next.js',
  'MongoDB', 'PostgreSQL', 'Flutter', 'Android / Kotlin', 'iOS / Swift',
  'Content Writing', 'Copywriting', 'SEO Marketing', 'Data Analysis', 'Docker'
];

export const SkillSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [selectedSkills, setSelectedSkills] = useState<string[]>(user?.skills || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      if (selectedSkills.length >= 15) {
        toastError('Limit reached', 'You can select up to 15 skills');
        return;
      }
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSkill.trim()) return;
    const clean = customSkill.trim();
    if (!selectedSkills.includes(clean)) {
      setSelectedSkills([...selectedSkills, clean]);
    }
    setCustomSkill('');
  };

  const handleSaveSkills = async () => {
    if (selectedSkills.length === 0) {
      toastError('Select Skills', 'Please select at least 1 skill to continue');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authAPI.updateMe({ skills: selectedSkills });
      if (res.success && res.data) {
        updateUser(res.data);
        toastSuccess('Skills Saved!', 'Now let\'s set up your profile details');
        navigate('/register/profile-setup');
      } else {
        toastError('Failed', res.message || 'Could not save skills');
      }
    } catch (err: any) {
      toastError('Error', err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSkills = POPULAR_SKILLS.filter((s) =>
    s.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Navbar />

      <main style={{
        flex: 1,
        maxWidth: '760px',
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
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
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
              <Sparkles size={14} /> Profile Setup: Skills
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
              What are your top skills?
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Select skills to help Connecta match you with relevant client jobs ({selectedSkills.length}/15 selected)
            </p>
          </div>

          {/* Search bar & Add Custom Skill */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div className="input-wrapper">
              <Search className="input-icon-left" size={18} />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
              />
            </div>

            <form onSubmit={handleAddCustomSkill} className="input-wrapper">
              <input
                type="text"
                placeholder="Add custom skill + Enter"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                className="input-field no-icon"
              />
              <button
                type="submit"
                className="input-icon-right"
                style={{ background: 'var(--primary)', color: '#fff', padding: '6px', borderRadius: '6px' }}
              >
                <Plus size={16} />
              </button>
            </form>
          </div>

          {/* Selected Skills Chips */}
          {selectedSkills.length > 0 && (
            <div style={{
              background: 'var(--bg-secondary)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '28px'
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px' }}>
                SELECTED SKILLS:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selectedSkills.map((skill) => (
                  <motion.span
                    key={skill}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--grad-primary)',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {skill}
                    <X size={14} style={{ cursor: 'pointer' }} onClick={() => toggleSkill(skill)} />
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          {/* Available Skills Grid */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '36px' }}>
            {filteredSkills.map((skill) => {
              const isSelected = selectedSkills.includes(skill);
              return (
                <motion.button
                  key={skill}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => toggleSkill(skill)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 'var(--radius-full)',
                    background: isSelected ? 'var(--primary)' : 'var(--bg-secondary)',
                    color: isSelected ? '#ffffff' : 'var(--text-primary)',
                    border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  {isSelected ? <Check size={16} /> : <Plus size={16} />} {skill}
                </motion.button>
              );
            })}
          </div>

          {/* Continue Action */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveSkills}
            disabled={submitting || selectedSkills.length === 0}
            className="btn-primary"
            style={{ width: '100%', padding: '16px' }}
          >
            Save Skills & Continue <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};
