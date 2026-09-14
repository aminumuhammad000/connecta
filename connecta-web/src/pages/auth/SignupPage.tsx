import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MessageSquare, ArrowRight, CheckCircle2, AlertCircle, Loader2, Copy } from 'lucide-react';
import { PageArtwork } from '../../components/common/PageArtwork';
import { GoogleAuthButton } from '../../components/common/GoogleAuthButton';
import { authAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../contexts/RoleContext';

export const SignupPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const roleQuery = (searchParams.get('role') as 'client' | 'freelancer') || 'freelancer';
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { setRole } = useRole();
  const { error: toastError } = useToast();

  React.useEffect(() => {
    if (roleQuery) {
      setRole(roleQuery);
    }
  }, [roleQuery, setRole]);

  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.userType === 'client') {
        navigate('/client/dashboard', { replace: true });
      } else {
        navigate('/freelancer/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const [formData, setFormData] = useState(() => {
    const saved = sessionStorage.getItem('signup_step1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          firstName: parsed.firstName || '',
          lastName: parsed.lastName || '',
          email: parsed.email || '',
          phoneNumber: parsed.phoneNumber || '',
          whatsapp: parsed.whatsapp || '',
        };
      } catch {
        // fallback
      }
    }
    return {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      whatsapp: '',
    };
  });

  // Step 1: Email OTP verification state
  // Step 2: Details entry state (First Name, Last Name, Phone, WhatsApp)
  const [signupStep, setSignupStep] = useState<1 | 2>(() => {
    const saved = sessionStorage.getItem('signup_step1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.emailVerified) return 2;
      } catch {
        // fallback
      }
    }
    return 1;
  });

  const [otpCode, setOtpCode] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { success: toastSuccess } = useToast();

  const [emailChecking, setEmailChecking] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [emailErrorMsg, setEmailErrorMsg] = useState('');

  const handleEmailBlur = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      setEmailStatus('invalid');
      setEmailErrorMsg('Please enter a valid email address');
      return;
    }

    setEmailChecking(true);
    try {
      const res = await authAPI.checkEmail(formData.email);
      if (res.success) {
        setEmailStatus('valid');
        setEmailErrorMsg('');
      } else {
        setEmailStatus('invalid');
        setEmailErrorMsg(res.message || 'Email is already registered');
      }
    } catch {
      setEmailStatus('idle');
    } finally {
      setEmailChecking(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.email.includes('@')) {
      toastError('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (emailStatus === 'invalid') {
      toastError('Email Taken', emailErrorMsg || 'Email is already registered');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await authAPI.initiateSignup(formData.email.trim().toLowerCase(), 'User');
      if (res.success) {
        setOtpSent(true);
        toastSuccess('OTP Sent!', `Verification code sent to ${formData.email}`);
      } else {
        toastError('Failed to Send OTP', res.message || 'Could not send verification code');
      }
    } catch (err: any) {
      toastError('Error', err.response?.data?.message || err.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 4) {
      toastError('Invalid Code', 'Please enter the 4-digit OTP code sent to your email');
      return;
    }

    setVerifyingOtp(true);
    try {
      const res = await authAPI.verifyOtp(formData.email.trim().toLowerCase(), otpCode.trim());
      if (res.success) {
        toastSuccess('Email Verified!', 'Now complete your profile details below.');
        sessionStorage.setItem('signup_step1', JSON.stringify({
          ...formData,
          emailVerified: true,
          otpCode: otpCode.trim(),
          userType: roleQuery
        }));
        setSignupStep(2);
      } else {
        toastError('Verification Failed', res.message || 'Invalid or expired OTP code');
      }
    } catch (err: any) {
      toastError('Error', err.response?.data?.message || err.message || 'Failed to verify OTP');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (!formData.email) return;
    setResendingOtp(true);
    try {
      const res = await authAPI.initiateSignup(formData.email.trim().toLowerCase(), 'User');
      if (res.success) {
        toastSuccess('Code Resent', `A fresh OTP code was sent to ${formData.email}`);
      } else {
        toastError('Failed', res.message || 'Could not resend OTP');
      }
    } catch (err: any) {
      toastError('Error', err.response?.data?.message || err.message || 'Failed to resend OTP');
    } finally {
      setResendingOtp(false);
    }
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toastError('Required Fields Missing', 'Please fill in First Name, Last Name, and Email');
      return;
    }

    sessionStorage.setItem('signup_step1', JSON.stringify({
      ...formData,
      emailVerified: true,
      otpCode,
      userType: roleQuery
    }));
    navigate(`/register/password?role=${roleQuery}`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <PageArtwork />
      <Navbar />

      <main style={{
        flex: 1,
        maxWidth: '480px',
        margin: '0 auto',
        padding: '40px 24px 60px',
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
          style={{ padding: '36px 28px', width: '100%', borderRadius: 'var(--radius-lg)' }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            {/* Role indicator pill */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '20px',
              background: roleQuery === 'client' ? 'rgba(43, 42, 107, 0.08)' : 'rgba(253, 103, 48, 0.08)',
              color: roleQuery === 'client' ? '#2B2A6B' : 'var(--primary)',
              fontSize: '0.78rem',
              fontWeight: 700,
              marginBottom: '10px'
            }}>
              <span>{roleQuery === 'client' ? '💼 Client Account · Hiring Talent' : '⚡ Freelancer Account · Working & Earning'}</span>
              <Link to="/register/role" style={{ marginLeft: '6px', fontSize: '0.72rem', color: 'inherit', opacity: 0.7, textDecoration: 'underline' }}>
                Change
              </Link>
            </div>

            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '3px 10px',
                borderRadius: '20px',
                background: 'rgba(253, 103, 48, 0.08)',
                color: 'var(--primary)',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.5px',
                marginBottom: '8px'
              }}>
                Step {signupStep} of 2
              </div>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              {signupStep === 1 ? 'Verify Email' : 'Account Details'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
              {signupStep === 1 ? 'Enter email to receive code' : 'Fill in your details below'}
            </p>

            {/* Verified Email Minimal Pill at Top Header */}
            {signupStep === 2 && formData.email && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '10px',
                padding: '4px 12px',
                borderRadius: '20px',
                background: 'rgba(34, 197, 94, 0.08)',
                border: '1px solid rgba(34, 197, 94, 0.25)',
                color: 'var(--success)',
                fontSize: '0.78rem',
                fontWeight: 700
              }}>
                <CheckCircle2 size={13} />
                <span style={{ color: 'var(--text-primary)' }}>{formData.email}</span>
              </div>
            )}
          </div>

          {/* STEP 1: EMAIL & OTP VERIFICATION */}
          {signupStep === 1 ? (
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendOtp}>
                  {/* Email Address Input */}
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label className="form-label" style={{ fontSize: '0.82rem' }}>
                      <span>Email Address *</span>
                      {emailChecking && <span style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}><Loader2 size={12} className="animate-spin" /> Verifying</span>}
                    </label>
                    <div className="input-wrapper">
                      <Mail className="input-icon-left" size={17} />
                      <input
                        type="email"
                        required
                        placeholder="name@company.com"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          setEmailStatus('idle');
                        }}
                        onBlur={handleEmailBlur}
                        className={`input-field ${emailStatus === 'valid' ? 'input-success' : emailStatus === 'invalid' ? 'input-error' : ''}`}
                      />
                      {emailStatus === 'valid' && (
                        <div className="input-icon-right" title="Email Available">
                          <CheckCircle2 size={17} color="var(--success)" />
                        </div>
                      )}
                      {emailStatus === 'invalid' && (
                        <div className="input-icon-right" title="Email Invalid">
                          <AlertCircle size={17} color="var(--error)" />
                        </div>
                      )}
                    </div>
                    {emailStatus === 'invalid' && (
                      <div className="error-text" style={{ marginTop: '6px' }}>
                        <AlertCircle size={13} /> {emailErrorMsg}
                      </div>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={sendingOtp || emailStatus === 'invalid' || emailChecking || !formData.email}
                    className="btn-primary"
                    style={{ width: '100%', padding: '14px', fontSize: '0.98rem' }}
                  >
                    {sendingOtp ? (
                      <><Loader2 size={18} className="animate-spin" /> Sending Verification OTP...</>
                    ) : (
                      <>Send Verification OTP <ArrowRight size={18} /></>
                    )}
                  </motion.button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp}>
                  <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', marginBottom: '18px', fontSize: '0.85rem' }}>
                    Sent OTP code to <strong style={{ color: 'var(--primary)' }}>{formData.email}</strong>.{' '}
                    <button type="button" onClick={() => setOtpSent(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>
                      Change Email
                    </button>
                  </div>

                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label className="form-label" style={{ fontSize: '0.82rem' }}>Enter 4-Digit OTP Code *</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="e.g. 4821"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="input-field"
                        style={{ letterSpacing: '4px', fontWeight: 700, fontSize: '1.1rem', textAlign: 'center' }}
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={verifyingOtp || otpCode.length < 4}
                    className="btn-primary"
                    style={{ width: '100%', padding: '14px', fontSize: '0.98rem' }}
                  >
                    {verifyingOtp ? (
                      <><Loader2 size={18} className="animate-spin" /> Verifying Code...</>
                    ) : (
                      <>Verify OTP & Continue <ArrowRight size={18} /></>
                    )}
                  </motion.button>

                  <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                    Didn't receive the code?{' '}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendingOtp}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                    >
                      {resendingOtp ? 'Resending...' : 'Resend OTP'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* STEP 2: PROFILE DETAILS FORM */
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {/* First Name */}
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.82rem' }}>First Name *</label>
                  <div className="input-wrapper">
                    <User className="input-icon-left" size={17} />
                    <input
                      type="text"
                      required
                      placeholder="Usman"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.82rem' }}>Last Name *</label>
                  <div className="input-wrapper">
                    <User className="input-icon-left" size={17} />
                    <input
                      type="text"
                      required
                      placeholder="Coder"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>



              {/* Phone Number */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.82rem' }}>Phone Number</label>
                <div className="input-wrapper">
                  <Phone className="input-icon-left" size={17} />
                  <input
                    type="tel"
                    placeholder="+234 801 234 5678"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              {/* WhatsApp Number with Minimalist "Same as Phone" Icon Button */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', marginBottom: 0 }}>WhatsApp (Optional)</label>
                  {formData.phoneNumber && formData.whatsapp !== formData.phoneNumber && (
                    <button
                      type="button"
                      title="Use phone number"
                      onClick={() => setFormData({ ...formData, whatsapp: formData.phoneNumber })}
                      style={{
                        background: 'rgba(253, 103, 48, 0.08)',
                        border: 'none',
                        color: 'var(--primary)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'opacity 0.2s'
                      }}
                    >
                      <Copy size={11} /> Same as phone
                    </button>
                  )}
                </div>
                <div className="input-wrapper">
                  <MessageSquare className="input-icon-left" size={17} />
                  <input
                    type="tel"
                    placeholder="+234 801 234 5678"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: '14px', marginTop: '6px', fontSize: '0.98rem' }}
              >
                Set Account Password <ArrowRight size={18} />
              </motion.button>
            </form>
          )}

          {/* Divider & Google Auth (Only shown during Step 1) */}
          {signupStep === 1 && (
            <>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                margin: '24px 0 20px',
                color: 'var(--text-muted)',
                fontSize: '0.82rem'
              }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                <span>OR REGISTER WITH</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
              </div>

              <GoogleAuthButton mode="signup" userType={roleQuery} />
            </>
          )}

          {/* Footer Link */}
          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 700, color: 'var(--primary)' }}>
              Sign In
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};
