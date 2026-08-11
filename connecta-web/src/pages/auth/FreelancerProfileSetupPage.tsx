import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { motion } from 'framer-motion';
import { Camera, Briefcase, Clock, ArrowRight, Sparkles, Loader2, Check } from 'lucide-react';
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
        // Redirect to animated loader setup progress page
        navigate('/register/setup-progress');
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
        maxWidth: '640px',
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
              <Sparkles size={14} /> Profile Setup: Details
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
              Build Your Freelancer Bio
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Clients look at your title, bio, and work preference when reviewing proposals
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Profile Picture Upload Circle */}
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
                    <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    `${user?.firstName?.[0] || 'F'}${user?.lastName?.[0] || ''}`
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
                Click camera to upload profile photo (Max 5MB)
              </span>
            </div>

            {/* Professional Title */}
            <div className="form-group">
              <label className="form-label">Professional Title *</label>
              <div className="input-wrapper">
                <Briefcase className="input-icon-left" size={18} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Software Engineer, UI/UX Designer..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            {/* Work Type & Years Experience */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
              {/* Work Type Choice */}
              <div className="form-group">
                <label className="form-label">Work Type Preference *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setWorkType('freelancing')}
                    style={{
                      padding: '10px 8px',
                      borderRadius: 'var(--radius-md)',
                      background: workType === 'freelancing' ? 'var(--grad-glow)' : 'var(--bg-secondary)',
                      border: workType === 'freelancing' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      color: workType === 'freelancing' ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: workType === 'freelancing' ? 700 : 500,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    {workType === 'freelancing' && <Check size={14} />} Freelancing
                  </button>

                  <button
                    type="button"
                    onClick={() => setWorkType('permanent')}
                    style={{
                      padding: '10px 8px',
                      borderRadius: 'var(--radius-md)',
                      background: workType === 'permanent' ? 'var(--grad-glow)' : 'var(--bg-secondary)',
                      border: workType === 'permanent' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      color: workType === 'permanent' ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: workType === 'permanent' ? 700 : 500,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    {workType === 'permanent' && <Check size={14} />} Permanent Job
                  </button>
                </div>
              </div>

              {/* Years Experience */}
              <div className="form-group">
                <label className="form-label">Years Experience</label>
                <div className="input-wrapper">
                  <Clock className="input-icon-left" size={18} />
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 4"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Professional Bio */}
            <div className="form-group">
              <label className="form-label">Professional Bio / About Me *</label>
              <textarea
                required
                rows={4}
                placeholder="Describe your background, key strengths, experience with startups or enterprise projects..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
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
                <><Loader2 size={18} className="animate-spin" /> Saving Profile...</>
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
