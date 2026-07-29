import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { motion } from 'framer-motion';
import { Camera, Briefcase, DollarSign, Clock, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export const FreelancerProfileSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [title, setTitle] = useState(user?.title || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [hourlyRate, setHourlyRate] = useState<number | string>(user?.hourlyRate || '');
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
      const res = await authAPI.uploadFile(file);
      if (res.success && res.data?.url) {
        setProfileImage(res.data.url);
        toastSuccess('Photo Uploaded!', 'Your profile picture has been updated');
      } else {
        toastError('Upload failed', res.message || 'Could not upload image');
      }
    } catch {
      toastError('Upload Error', 'Failed to upload image to server');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !bio || !hourlyRate) {
      toastError('Missing Information', 'Please fill in Title, Bio, and Hourly Rate');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        title,
        bio,
        hourlyRate: Number(hourlyRate),
        yearsOfExperience: Number(yearsOfExperience || 0),
        profileImage
      };

      const res = await authAPI.updateMe(payload);
      if (res.success && res.data) {
        updateUser(res.data);
        toastSuccess('Profile Complete!', 'Welcome to your Freelancer Dashboard');
        navigate('/freelancer/dashboard');
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
              Clients look at your title, bio, and hourly rate when reviewing proposals
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
                  placeholder="e.g. Senior Full-Stack Mobile & Web Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            {/* Hourly Rate & Years Experience */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Hourly Rate (₦) *</label>
                <div className="input-wrapper">
                  <DollarSign className="input-icon-left" size={18} />
                  <input
                    type="number"
                    required
                    min="500"
                    placeholder="e.g. 10000"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

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
                <>Finish & Open Dashboard <CheckCircle2 size={18} /></>
              )}
            </motion.button>
          </form>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};
