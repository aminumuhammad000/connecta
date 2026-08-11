import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { motion } from 'framer-motion';
import { Camera, Building2, Globe, DollarSign, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { AFRICAN_COUNTRIES, CURRENCIES } from './CountryCurrencyPage';

export const ClientProfileSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [companyName, setCompanyName] = useState(user?.title || '');
  const [companyBio, setCompanyBio] = useState(user?.bio || '');
  const [selectedCountry, setSelectedCountry] = useState<string>(user?.country || 'Nigeria');
  const [selectedCurrency, setSelectedCurrency] = useState<string>(user?.currency || 'NGN');
  const [profileImage, setProfileImage] = useState<string>(user?.profileImage || '');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toastError('File too large', 'Company logo / photo must be under 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setProfileImage(compressedBase64);
          toastSuccess('Logo Uploaded!', 'Your company logo has been updated');
          setUploadingImage(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch {
      toastError('Upload Error', 'Could not process image file');
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim() || !companyBio.trim()) {
      toastError('Missing Information', 'Please enter your Company Name and Brief Bio / Description');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        title: companyName.trim(),
        bio: companyBio.trim(),
        country: selectedCountry,
        currency: selectedCurrency,
        profileImage
      };

      const res = await authAPI.updateMe(payload);
      if (res.success && res.data) {
        updateUser(res.data);
        // Redirect to animated loader setup progress page
        navigate('/register/setup-progress');
      } else {
        toastError('Failed', res.message || 'Could not save client profile details');
      }
    } catch (err: any) {
      toastError('Error', err.message || 'Failed to complete profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Navbar />

      <main style={{
        flex: 1,
        maxWidth: '720px',
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
              <Sparkles size={14} /> Client Onboarding: Step 3 of 3
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
              Finalize Your Client Profile
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Set up your company profile, country of operations, and default escrow funding currency
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Company Logo Upload Circle */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}>
              <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                <div style={{
                  width: '100px',
                  maxWidth: '100%',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'var(--grad-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '2rem',
                  fontWeight: 700,
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-glow)'
                }}>
                  {profileImage ? (
                    <img src={profileImage} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Building2 size={40} color="#ffffff" />
                  )}
                </div>

                <label style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {uploadingImage ? <Loader2 size={16} className="animate-spin" color="var(--primary)" /> : <Camera size={16} color="var(--primary)" />}
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </label>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                Upload company logo or photo (Max 5MB)
              </span>
            </div>

            {/* Company Name / Organization */}
            <div className="form-group">
              <label className="form-label">Company Name / Organization *</label>
              <div className="input-wrapper">
                <Building2 className="input-icon-left" size={18} />
                <input
                  type="text"
                  required
                  placeholder="e.g. TechPulse Solutions, Zenith Global Ltd..."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            {/* Country & Currency Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Globe size={16} color="var(--primary)" /> Country *
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                    const found = AFRICAN_COUNTRIES.find(c => c.name === e.target.value);
                    if (found) setSelectedCurrency(found.defaultCurrency);
                  }}
                  className="input-field no-icon"
                >
                  {AFRICAN_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name}>{c.flag} {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <DollarSign size={16} color="var(--primary)" /> Preferred Escrow Currency *
                </label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="input-field no-icon"
                >
                  {CURRENCIES.map((curr) => (
                    <option key={curr.code} value={curr.code}>{curr.symbol} - {curr.name} ({curr.code})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Company Description */}
            <div className="form-group">
              <label className="form-label">Company Description / Project Summary *</label>
              <textarea
                required
                rows={4}
                placeholder="Briefly describe what your organization does and what projects or roles you plan to hire for..."
                value={companyBio}
                onChange={(e) => setCompanyBio(e.target.value)}
                className="input-field no-icon"
                style={{ resize: 'vertical' }}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ width: '100%', padding: '16px', marginTop: '12px' }}
            >
              {submitting ? (
                <><Loader2 size={18} className="animate-spin" /> Finalizing Profile...</>
              ) : (
                <>Next <ArrowRight size={18} /></>
              )}
            </motion.button>
          </form>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};
