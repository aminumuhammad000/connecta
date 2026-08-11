import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { motion } from 'framer-motion';
import { Mail, KeyRound, ArrowRight, ShieldCheck, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import { PageArtwork } from '../../components/common/PageArtwork';
import { authAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

export const SignupOtpPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const roleQuery = (searchParams.get('role') as 'client' | 'freelancer') || 'freelancer';
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();

  const savedData = (() => {
    try {
      return JSON.parse(sessionStorage.getItem('signup_step1') || '{}');
    } catch {
      return {};
    }
  })();

  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!savedData.email) {
      toastError('Missing Details', 'Please start signup from step 1');
      navigate(`/register?role=${roleQuery}`);
      return;
    }

    if (otp.length < 4) {
      toastError('Invalid Code', 'Please enter the 4-digit OTP sent to your email');
      return;
    }

    setVerifying(true);
    try {
      const res = await authAPI.verifyOtp(savedData.email, otp);
      if (res.success) {
        toastSuccess('Email Verified!', 'Now create a secure password for your account');
        // Save verification flag in sessionStorage
        sessionStorage.setItem('signup_step1', JSON.stringify({
          ...savedData,
          otpVerified: true,
          otpCode: otp
        }));
        navigate(`/register/password?role=${roleQuery}`);
      } else {
        toastError('Verification Failed', res.message || 'Invalid or expired OTP code');
      }
    } catch (err: any) {
      toastError('Error', err.response?.data?.message || err.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!savedData.email) return;

    setResending(true);
    try {
      const res = await authAPI.initiateSignup(savedData.email, savedData.firstName);
      if (res.success) {
        toastSuccess('Code Resent', `A new OTP has been sent to ${savedData.email}`);
      } else {
        toastError('Failed', res.message || 'Could not resend OTP');
      }
    } catch (err: any) {
      toastError('Error', err.response?.data?.message || err.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
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
          <Link to={`/register?role=${roleQuery}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            <ArrowLeft size={16} /> Back to details
          </Link>

          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(253, 103, 48, 0.1)',
              color: 'var(--primary)',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 16px'
            }}>
              <ShieldCheck size={28} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px' }}>
              Verify Your Email
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              We've sent a verification code to <strong style={{ color: 'var(--text-primary)' }}>{savedData.email || 'your email'}</strong>
            </p>
          </div>

          <form onSubmit={handleVerifyOtp}>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">4-Digit Verification OTP *</label>
              <div className="input-wrapper">
                <KeyRound className="input-icon-left" size={18} />
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="Enter OTP (e.g. 4821)"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="input-field"
                  style={{ letterSpacing: '4px', fontWeight: 700, fontSize: '1.1rem' }}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={verifying || otp.length < 4}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            >
              {verifying ? (
                <><Loader2 size={18} className="animate-spin" /> Verifying Code...</>
              ) : (
                <>Verify & Set Password <ArrowRight size={18} /></>
              )}
            </motion.button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Didn't receive the code?{' '}
            <button
              onClick={handleResendOtp}
              disabled={resending}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {resending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Resend OTP
            </button>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};
