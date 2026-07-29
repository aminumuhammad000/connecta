import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, KeyRound, Lock, ArrowRight, ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';
import { PageArtwork } from '../../components/common/PageArtwork';
import { authAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toastError('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authAPI.forgotPassword(email);
      if (res.success) {
        toastSuccess('Code Sent', `We sent a 6-digit verification code to ${email}`);
        setStep(2);
      } else {
        toastError('Failed', res.message || 'Could not send verification code');
      }
    } catch (err: any) {
      toastError('Error', err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      toastError('Invalid Code', 'Please enter the verification code');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authAPI.verifyOtp(email, otp);
      if (res.success) {
        toastSuccess('Code Verified', 'Now create your new password');
        setStep(3);
      } else {
        toastError('Verification Failed', res.message || 'Invalid or expired OTP code');
      }
    } catch (err: any) {
      toastError('Error', err.response?.data?.message || err.message || 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toastError('Weak Password', 'Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toastError('Password Mismatch', 'Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authAPI.resetPassword(email, otp, newPassword);
      if (res.success) {
        toastSuccess('Password Reset!', 'Your password has been changed. Please sign in.');
        navigate('/login');
      } else {
        toastError('Reset Failed', res.message || 'Could not reset password');
      }
    } catch (err: any) {
      toastError('Error', err.response?.data?.message || err.message || 'Reset failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <PageArtwork />
      <Navbar />

      <main style={{
        flex: 1,
        maxWidth: '480px',
        margin: '0 auto',
        padding: '60px 24px 80px',
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
          {/* Back link */}
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            <ArrowLeft size={16} /> Back to Sign In
          </Link>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>
              {step === 1 && 'Reset Password'}
              {step === 2 && 'Enter Code'}
              {step === 3 && 'New Password'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {step === 1 && 'Enter your email for reset OTP'}
              {step === 2 && `Code sent to ${email}`}
              {step === 3 && 'Enter your new password'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: Email Form */}
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleRequestOtp}
              >
                <div className="form-group">
                  <label className="form-label">Registered Email Address</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon-left" size={18} />
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                  style={{ width: '100%', padding: '15px' }}
                >
                  {submitting ? (
                    <><Loader2 size={18} className="animate-spin" /> Sending Code...</>
                  ) : (
                    <>Send Code <ArrowRight size={18} /></>
                  )}
                </motion.button>
              </motion.form>
            )}

            {/* STEP 2: OTP Verification Form */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleVerifyOtp}
              >
                <div className="form-group">
                  <label className="form-label">Verification Code (OTP)</label>
                  <div className="input-wrapper">
                    <KeyRound className="input-icon-left" size={18} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="input-field"
                      style={{ letterSpacing: '4px', fontSize: '1.1rem', fontWeight: 700 }}
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                  style={{ width: '100%', padding: '15px' }}
                >
                  {submitting ? (
                    <><Loader2 size={18} className="animate-spin" /> Verifying...</>
                  ) : (
                    <>Verify Code <ArrowRight size={18} /></>
                  )}
                </motion.button>
              </motion.form>
            )}

            {/* STEP 3: Reset Password Form */}
            {step === 3 && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleResetPassword}
              >
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon-left" size={18} />
                    <input
                      type="password"
                      required
                      placeholder="Min. 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon-left" size={18} />
                    <input
                      type="password"
                      required
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                  style={{ width: '100%', padding: '15px' }}
                >
                  {submitting ? (
                    <><Loader2 size={18} className="animate-spin" /> Updating Password...</>
                  ) : (
                    <>Reset Password <ShieldCheck size={18} /></>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};
