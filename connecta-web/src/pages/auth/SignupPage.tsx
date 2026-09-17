import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MessageSquare, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Loader2, Copy } from 'lucide-react';
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
  const { user, isAuthenticated, isLoading } = useAuth();
  const { setRole } = useRole();
  const { error: toastError } = useToast();

  React.useEffect(() => {
    if (roleQuery) {
      setRole(roleQuery);
    }
  }, [roleQuery, setRole]);

  React.useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && user) {
      if (user.userType === 'client') {
        navigate('/client/dashboard', { replace: true });
      } else {
        navigate('/freelancer/dashboard', { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, user, navigate]);

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
      if (res.exists || res.available === false) {
        setEmailStatus('invalid');
        setEmailErrorMsg(res.message || 'Email is already registered. Please sign in instead.');
      } else {
        setEmailStatus('valid');
        setEmailErrorMsg('');
      }
    } catch {
      setEmailStatus('idle');
    } finally {
      setEmailChecking(false);
    }
  };

  // Phone availability state
  const [phoneChecking, setPhoneChecking] = useState(false);
  const [phoneStatus, setPhoneStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [phoneErrorMsg, setPhoneErrorMsg] = useState('');

  const validatePhone = async (phoneNumberToValidate: string): Promise<boolean> => {
    const trimmed = (phoneNumberToValidate || '').trim();
    if (!trimmed) {
      setPhoneStatus('invalid');
      setPhoneErrorMsg('Phone number is required');
      return false;
    }

    const digitsOnly = trimmed.replace(/\D/g, '');
    if (digitsOnly.length < 8) {
      setPhoneStatus('invalid');
      setPhoneErrorMsg('Please enter a valid phone number (at least 8 digits)');
      return false;
    }

    setPhoneChecking(true);
    try {
      const res = await authAPI.checkPhone(trimmed);
      if (res.exists || res.available === false) {
        setPhoneStatus('invalid');
        setPhoneErrorMsg(res.message || 'This phone number is already registered. Please log in or use a different number.');
        return false;
      } else {
        setPhoneStatus('valid');
        setPhoneErrorMsg('');
        return true;
      }
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (err.response?.status === 400 && msg) {
        setPhoneStatus('invalid');
        setPhoneErrorMsg(msg);
        return false;
      }
      setPhoneStatus('idle');
      return true;
    } finally {
      setPhoneChecking(false);
    }
  };

  // Debounced instant phone validation as user types in Step 2
  React.useEffect(() => {
    if (signupStep !== 2) return;
    if (!formData.phoneNumber || !formData.phoneNumber.trim()) {
      setPhoneStatus('idle');
      setPhoneErrorMsg('');
      return;
    }
    const timer = setTimeout(() => {
      validatePhone(formData.phoneNumber);
    }, 350);
    return () => clearTimeout(timer);
  }, [formData.phoneNumber, signupStep]);

  const handlePhoneBlur = () => {
    if (formData.phoneNumber && phoneStatus !== 'valid') {
      validatePhone(formData.phoneNumber);
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

    const trimmedPhone = (formData.phoneNumber || '').trim();
    if (!trimmedPhone) {
      setPhoneStatus('invalid');
      setPhoneErrorMsg('Phone number is required');
      toastError('Phone Required', 'Please enter your phone number to continue');
      return;
    }

    if (phoneChecking) {
      toastError('Verifying Phone', 'Please wait while we check phone number availability...');
      return;
    }

    if (phoneStatus === 'invalid') {
      toastError('Phone Number Taken', phoneErrorMsg || 'This phone number is already registered. Please use another number.');
      return;
    }

    // Always verify phone availability before moving to password step
    if (phoneStatus !== 'valid') {
      const isAvailable = await validatePhone(trimmedPhone);
      if (!isAvailable) {
        toastError('Phone Number Taken', phoneErrorMsg || 'This phone number is already registered. Please use another number.');
        return;
      }
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
          {/* Top Bar Navigation */}
          {signupStep === 2 ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px'
            }}>
              <button
                type="button"
                onClick={() => setSignupStep(1)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  padding: 0
                }}
                title="Back to Email Verification"
                aria-label="Back to Email Verification"
              >
                <ArrowLeft size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: roleQuery === 'client' ? 'rgba(43, 42, 107, 0.08)' : 'rgba(253, 103, 48, 0.08)',
                  color: roleQuery === 'client' ? '#2B2A6B' : 'var(--primary)',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  <span>{roleQuery === 'client' ? '💼 Client' : '⚡ Freelancer'}</span>
                  <Link to="/register/role" style={{ marginLeft: '4px', fontSize: '0.7rem', color: 'inherit', opacity: 0.7, textDecoration: 'underline' }}>
                    Change
                  </Link>
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: 'rgba(253, 103, 48, 0.08)',
                  color: 'var(--primary)',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  Step 2 of 2
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 12px',
                borderRadius: '20px',
                background: roleQuery === 'client' ? 'rgba(43, 42, 107, 0.08)' : 'rgba(253, 103, 48, 0.08)',
                color: roleQuery === 'client' ? '#2B2A6B' : 'var(--primary)',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: '8px'
              }}>
                <span>{roleQuery === 'client' ? '💼 Client' : '⚡ Freelancer'}</span>
                <Link to="/register/role" style={{ marginLeft: '4px', fontSize: '0.7rem', color: 'inherit', opacity: 0.7, textDecoration: 'underline' }}>
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
                  Step 1 of 2
                </div>
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '4px', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
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



              {/* Phone Number with Instant Validation */}
              <div className="form-group" style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', marginBottom: 0 }}>
                    <span>Phone Number *</span>
                  </label>
                  {phoneChecking && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Loader2 size={12} className="animate-spin" /> Checking availability...
                    </span>
                  )}
                </div>
                <div className="input-wrapper">
                  <Phone className="input-icon-left" size={17} />
                  <input
                    type="tel"
                    required
                    placeholder="+234 801 234 5678"
                    value={formData.phoneNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, phoneNumber: e.target.value });
                      setPhoneStatus('idle');
                    }}
                    onBlur={handlePhoneBlur}
                    className={`input-field ${phoneStatus === 'valid' ? 'input-success' : phoneStatus === 'invalid' ? 'input-error' : ''}`}
                  />
                  {phoneChecking && (
                    <div className="input-icon-right" title="Checking Phone Number">
                      <Loader2 size={16} className="animate-spin" color="var(--primary)" />
                    </div>
                  )}
                  {!phoneChecking && phoneStatus === 'valid' && (
                    <div className="input-icon-right" title="Phone Number Available">
                      <CheckCircle2 size={17} color="var(--success)" />
                    </div>
                  )}
                  {!phoneChecking && phoneStatus === 'invalid' && (
                    <div className="input-icon-right" title="Phone Number Unavailable">
                      <AlertCircle size={17} color="var(--error)" />
                    </div>
                  )}
                </div>
                {phoneStatus === 'invalid' && (
                  <div className="error-text" style={{ marginTop: '6px', color: 'var(--error)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <AlertCircle size={13} /> {phoneErrorMsg}
                  </div>
                )}
                {phoneStatus === 'valid' && (
                  <div style={{ marginTop: '6px', color: 'var(--success)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <CheckCircle2 size={13} /> Phone number is available
                  </div>
                )}
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
                whileHover={!(phoneChecking || phoneStatus === 'invalid') ? { scale: 1.02 } : undefined}
                whileTap={!(phoneChecking || phoneStatus === 'invalid') ? { scale: 0.98 } : undefined}
                type="submit"
                disabled={phoneChecking || phoneStatus === 'invalid'}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  marginTop: '6px',
                  fontSize: '0.98rem',
                  opacity: (phoneChecking || phoneStatus === 'invalid') ? 0.6 : 1,
                  cursor: (phoneChecking || phoneStatus === 'invalid') ? 'not-allowed' : 'pointer'
                }}
              >
                {phoneChecking ? (
                  <><Loader2 size={18} className="animate-spin" /> Checking Phone Availability...</>
                ) : phoneStatus === 'invalid' ? (
                  <><AlertCircle size={18} /> Phone Already Registered</>
                ) : (
                  <>Set Account Password <ArrowRight size={18} /></>
                )}
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
