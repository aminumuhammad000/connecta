import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { motion } from 'framer-motion';
import { Camera, Briefcase, Clock, ArrowRight, ArrowLeft, Sparkles, Loader2, Check } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export const FreelancerProfileSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  // Clear prefilled dummy title so input comes as empty
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState(user?.bio || '');
  const [workType, setWorkType] = useState<'freelancing' | 'permanent'>('freelancing');
  const [yearsOfExperience, setYearsOfExperience] = useState<number | string>(user?.yearsOfExperience || '');
  const [profileImage, setProfileImage] = useState<string>(user?.profileImage || '');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toastError('File too large', 'Profile picture must be under 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      // 1. Try server API upload endpoint
      const res = await authAPI.uploadFile(file);
      if (res && (res.success || res.data?.url)) {
        const imageUrl = res.data?.url || (res as any).url;
        if (imageUrl) {
          setProfileImage(imageUrl);
          toastSuccess('Photo Uploaded!', 'Your profile picture has been updated');
          setUploadingImage(false);
          return;
        }
      }
      throw new Error('Server returned invalid file structure');
    } catch {
      // 2. Client-side compressed Base64 fallback if server upload route is unavailable
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
            toastSuccess('Photo Uploaded!', 'Your profile picture has been attached');
            setUploadingImage(false);
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      } catch {
        toastError('Upload Error', 'Could not read image file. Please try another image.');
        setUploadingImage(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !bio || !workType) {
      toastError('Missing Information', 'Please fill in Title, Bio, and select Work Type');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        title: title.trim(),
        bio: bio.trim(),
        workType,
        yearsOfExperience: Number(yearsOfExperience || 0),
        profileImage
      };

      const res = await authAPI.updateMe(payload);
      if (res.success && res.data) {
        updateUser(res.data);
        // Redirect to mandatory Terms and Conditions page before dashboard
        navigate('/register/terms');
      } else {
        toastError('Failed', res.message || 'Could not save profile details');
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
        maxWidth: '620px',
        margin: '0 auto',
        padding: '30px 20px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{ padding: '32px 28px', width: '100%' }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px', position: 'relative' }}>
            <button
              type="button"
              onClick={() => navigate('/register/country-currency')}
              title="Go back"
              aria-label="Go back"
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'rgba(253, 103, 48, 0.08)',
                border: 'none',
                color: 'var(--primary)',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
                transition: 'transform 0.2s ease, background 0.2s ease'
              }}
            >
              <ArrowLeft size={18} />
            </button>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 12px',
              borderRadius: '20px',
              background: 'rgba(253, 103, 48, 0.08)',
              color: 'var(--primary)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.4px',
              marginBottom: '10px'
            }}>
              Step 4 of 4 · Profile Details
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '4px', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              Build Your Bio
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              Add your title, bio, and experience to complete your profile
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Profile Picture Upload Circle */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ position: 'relative', width: '84px', height: '84px' }}>
                <div style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  background: 'var(--grad-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '1.6rem',
                  fontWeight: 700,
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    `${user?.firstName?.[0] || 'F'}${user?.lastName?.[0] || ''}`
                  )}
                </div>

                <label style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  background: 'var(--bg-secondary)',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {uploadingImage ? <Loader2 size={14} className="animate-spin" color="var(--primary)" /> : <Camera size={14} color="var(--primary)" />}
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </label>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Upload profile photo (Max 5MB)
              </span>
            </div>

            {/* Professional Title */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '0.82rem', marginBottom: '6px' }}>Professional Title *</label>
              <div className="input-wrapper">
                <Briefcase className="input-icon-left" size={16} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Full Stack Developer, UI Designer..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                  style={{ fontSize: '0.88rem' }}
                />
              </div>
            </div>

            {/* Work Type & Years Experience Dropdowns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {/* Work Type Choice Dropdown */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.82rem', marginBottom: '6px' }}>Work Preference *</label>
                <div className="input-wrapper">
                  <Briefcase className="input-icon-left" size={16} />
                  <select
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value as 'freelancing' | 'permanent')}
                    className="input-field"
                    style={{ cursor: 'pointer', appearance: 'auto', fontSize: '0.88rem', fontWeight: 600 }}
                  >
                    <option value="freelancing" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Freelance Work</option>
                    <option value="permanent" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Permanent Job</option>
                  </select>
                </div>
              </div>

              {/* Years Experience Dropdown */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.82rem', marginBottom: '6px' }}>Years Experience *</label>
                <div className="input-wrapper">
                  <Clock className="input-icon-left" size={16} />
                  <select
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    className="input-field"
                    style={{ cursor: 'pointer', appearance: 'auto', fontSize: '0.88rem', fontWeight: 600 }}
                  >
                    <option value="" disabled style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Select experience</option>
                    <option value="0" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Less than 1 year</option>
                    <option value="1" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>1 year</option>
                    <option value="2" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>2 years</option>
                    <option value="3" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>3 years</option>
                    <option value="4" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>4 years</option>
                    <option value="5" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>5+ years</option>
                    <option value="7" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>7+ years</option>
                    <option value="10" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>10+ years (Senior)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Professional Bio */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ fontSize: '0.82rem', marginBottom: '6px' }}>Professional Bio *</label>
              <textarea
                required
                rows={3}
                placeholder="Briefly describe your core skills, experience, and projects..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="input-field no-icon"
                style={{ resize: 'vertical', fontSize: '0.86rem', padding: '10px 12px' }}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '0.98rem' }}
            >
              {submitting ? (
                <><Loader2 size={16} className="animate-spin" /> Saving Profile...</>
              ) : (
                <>Complete Setup <ArrowRight size={18} /></>
              )}
            </motion.button>
          </form>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};
