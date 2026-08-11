import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { motion } from 'framer-motion';
import { 
  Code, 
  Palette, 
  TrendingUp, 
  Briefcase, 
  PenTool, 
  Coffee, 
  HeartPulse, 
  GraduationCap, 
  Check, 
  ArrowRight, 
  Sparkles 
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export interface SectorOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  popularSkills: string[];
}

export const SECTORS: SectorOption[] = [
  {
    id: 'tech',
    name: 'Technology & Software',
    description: 'Web development, mobile apps, DevOps, data & cloud engineering.',
    icon: <Code size={24} />,
    popularSkills: [
      'React.js', 'Node.js', 'TypeScript', 'Python', 'React Native', 
      'Tailwind CSS', 'Next.js', 'MongoDB', 'PostgreSQL', 'Flutter', 
      'Android / Kotlin', 'iOS / Swift', 'Docker', 'AWS', 'Java', 'C#'
    ]
  },
  {
    id: 'design',
    name: 'Design & Creative',
    description: 'UI/UX design, brand identity, graphic design & motion graphics.',
    icon: <Palette size={24} />,
    popularSkills: [
      'UI/UX Design', 'Figma', 'Graphic Design', 'Adobe Illustrator', 'Adobe Photoshop', 
      'Logo Design', 'Motion Design', '3D Modeling', 'Video Editing', 'Product Design', 
      'Brand Identity', 'Wireframing'
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing & Sales',
    description: 'Social media, SEO, paid ads, sales funnels & growth strategy.',
    icon: <TrendingUp size={24} />,
    popularSkills: [
      'SEO Marketing', 'Social Media Management', 'Google Ads', 'Facebook Ads', 'Content Strategy', 
      'Email Marketing', 'Copywriting', 'Lead Generation', 'Sales Funnels', 'Brand Strategy', 
      'Influencer Marketing', 'Analytics'
    ]
  },
  {
    id: 'business',
    name: 'Business & Finance',
    description: 'Accounting, virtual assistance, business plan & financial modeling.',
    icon: <Briefcase size={24} />,
    popularSkills: [
      'Accounting', 'Bookkeeping', 'Virtual Assistance', 'Financial Modeling', 'Business Consulting', 
      'Data Analysis', 'Project Management', 'Excel / Sheets', 'QuickBooks', 'Customer Support', 
      'Administrative Support'
    ]
  },
  {
    id: 'writing',
    name: 'Writing & Translation',
    description: 'Copywriting, blog posts, technical writing, proofreading & translation.',
    icon: <PenTool size={24} />,
    popularSkills: [
      'Content Writing', 'Copywriting', 'Technical Writing', 'Blog Writing', 'Proofreading & Editing', 
      'Translation', 'Ghostwriting', 'Creative Writing', 'SEO Writing', 'Scriptwriting'
    ]
  },
  {
    id: 'hospitality',
    name: 'Hospitality & Events',
    description: 'Event planning, catering, hosting, travel assistance & management.',
    icon: <Coffee size={24} />,
    popularSkills: [
      'Event Planning', 'Catering Management', 'Event Hosting', 'Travel Logistics', 'Customer Service', 
      'Hospitality Management', 'Vendor Coordination', 'Budget Management'
    ]
  },
  {
    id: 'health',
    name: 'Health & Fitness',
    description: 'Personal training, nutrition, wellness coaching & fitness programs.',
    icon: <HeartPulse size={24} />,
    popularSkills: [
      'Personal Training', 'Nutrition Coaching', 'Fitness Instruction', 'Wellness Coaching', 
      'Meal Planning', 'Yoga Instruction', 'Health Consulting', 'Sports Rehabilitation'
    ]
  },
  {
    id: 'education',
    name: 'Education & Training',
    description: 'Online tutoring, course design, academic coaching & skill training.',
    icon: <GraduationCap size={24} />,
    popularSkills: [
      'Online Tutoring', 'Curriculum Design', 'Course Creation', 'Language Teaching', 
      'Academic Coaching', 'STEM Tutoring', 'Instructional Design', 'E-Learning'
    ]
  }
];

export const SectorSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { error: toastError } = useToast();
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [customSectorName, setCustomSectorName] = useState<string>('');

  const handleContinue = () => {
    if (!selectedSector) {
      toastError('Select a Sector', 'Please select your primary professional sector to continue');
      return;
    }
    const finalSector = selectedSector === 'other' ? customSectorName.trim() : selectedSector;
    if (selectedSector === 'other' && !finalSector) {
      toastError('Specify Sector', 'Please enter your custom sector name');
      return;
    }
    // Save chosen sector in sessionStorage for skill filtering
    sessionStorage.setItem('selected_sector', finalSector);
    navigate(`/register/skills?sector=${encodeURIComponent(finalSector)}`);
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
              <Sparkles size={14} /> Profile Setup: Sector
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
              What is your primary sector?
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Choose your main industry so we can tailor the best skills and job opportunities for you
            </p>
          </div>

          {/* Sector Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {SECTORS.map((sector) => {
              const isSelected = selectedSector === sector.id;
              return (
                <motion.div
                  key={sector.id}
                  whileHover={{ scale: 1.02, translateY: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedSector(sector.id)}
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
                      {sector.icon}
                    </div>

                    <h3 style={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      marginBottom: '6px',
                      color: 'var(--text-primary)'
                    }}>
                      {sector.name}
                    </h3>

                    <p style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.45
                    }}>
                      {sector.description}
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

            {/* Other Sector Option */}
            <motion.div
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedSector('other')}
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-lg)',
                background: selectedSector === 'other' ? 'var(--grad-glow)' : 'var(--bg-secondary)',
                border: selectedSector === 'other' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
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
                  background: selectedSector === 'other' ? 'var(--primary)' : 'rgba(253, 103, 48, 0.1)',
                  color: selectedSector === 'other' ? '#ffffff' : 'var(--primary)',
                  display: 'grid',
                  placeItems: 'center',
                  marginBottom: '14px'
                }}>
                  <Sparkles size={24} />
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Other Sector
                </h3>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  Enter your custom field manually if not listed above.
                </p>
              </div>

              {selectedSector === 'other' && (
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

          {/* Custom Sector Input */}
          {selectedSector === 'other' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{ marginBottom: '28px' }}
            >
              <div className="form-group">
                <label className="form-label">Specify Your Sector *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Legal Services, Real Estate, Solar Engineering..."
                  value={customSectorName}
                  onChange={(e) => setCustomSectorName(e.target.value)}
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
            disabled={!selectedSector || (selectedSector === 'other' && !customSectorName.trim())}
            className="btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: '1rem' }}
          >
            Continue to Skills <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};
