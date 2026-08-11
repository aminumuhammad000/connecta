import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Check, X, ShieldCheck, Loader2 } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import confetti from 'canvas-confetti';

export const SignupPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const roleQuery = searchParams.get('role') || 'freelancer';
  const navigate = useNavigate();
  const { setUserAndToken } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();

  const [step1Data, setStep1Data] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const dataStr = sessionStorage.getItem('signup_step1');
    if (!dataStr) {
      navigate(`/register?role=${roleQuery}`);
      return;
    }
    setStep1Data(JSON.parse(dataStr));
  }, [navigate, roleQuery]);

  // Password requirements calculation
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const passedCount = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  
  const getStrengthLabel = () => {
    if (passedCount <= 2) return { text: 'Weak', color: 'var(--error)', width: '25%' };
    if (passedCount === 3) return { text: 'Fair', color: 'var(--warning)', width: '50%' };
    if (passedCount === 4) return { text: 'Good', color: '#3B82F6', width: '75%' };
    return { text: 'Strong', color: 'var(--success)', width: '100%' };
  };

  const isMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasMinLength) {
      toastError('Weak Password', 'Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toastError('Password Mismatch', 'Passwords do not match');
      return;
    }

    if (!step1Data) {
      toastError('Session Expired', 'Please re-enter your details');
      navigate('/register');
      return;
    }

    setSubmitting(true);
    try {
      if (!step1Data.firstName || !step1Data.email) {
        toastError('Missing Fields', 'First name and Email are required. Please go back to step 1.');
        navigate(`/register?role=${roleQuery}`);
        return;
      }

      const payload = {
        firstName: step1Data.firstName.trim(),
        lastName: (step1Data.lastName || '').trim(),
        email: step1Data.email.trim().toLowerCase(),
        password: password,
        phoneNumber: step1Data.phoneNumber || '',
        whatsapp: step1Data.whatsapp || '',
        userType: step1Data.userType || roleQuery || 'freelancer',
        otp: step1Data.otpCode || ''
      };

      console.log('Sending signup payload:', payload);

      const res = await authAPI.signup(payload);

      if (res.success && res.token && res.user) {
        setUserAndToken(res.user, res.token);
        
        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        toastSuccess('Account Created!', `Welcome to Connecta, ${res.user.firstName}`);
        sessionStorage.removeItem('signup_step1');

        if (res.user.userType === 'freelancer') {
          navigate('/register/sector');
        } else {
          navigate('/register/client-industry');
        }
      } else {
        toastError('Registration Failed', res.message || 'Could not create account');
      }
    } catch (err: any) {
      toastError('Error', err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const strength = getStrengthLabel();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Navbar />

      <main style={{
        flex: 1,
        maxWidth: '540px',
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
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>
              Set Password
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Create a password for your account
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div className="input-wrapper">
                <Lock className="input-icon-left" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="input-icon-right"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password Strength Animated Bar */}
              {password.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Strength:</span>
                    <span style={{ fontWeight: 700, color: strength.color }}>{strength.text}</span>
                  </div>
                  <div style={{ height: '5px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: strength.width, backgroundColor: strength.color }}
                      transition={{ duration: 0.3 }}
                      style={{ height: '100%' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <div className="input-wrapper">
                <Lock className="input-icon-left" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`input-field ${confirmPassword ? (isMatch ? 'input-success' : 'input-error') : ''}`}
                />
              </div>
              {confirmPassword.length > 0 && (
                <div className={isMatch ? 'success-text' : 'error-text'}>
                  {isMatch ? <><Check size={14} /> Passwords match</> : <><X size={14} /> Passwords do not match</>}
                </div>
              )}
            </div>

            {/* Checklist */}
            <div style={{
              background: 'var(--bg-secondary)',
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '24px',
              fontSize: '0.82rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Password must contain:</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: hasMinLength ? 'var(--success)' : 'var(--text-muted)' }}>
                {hasMinLength ? <Check size={14} /> : <X size={14} />} At least 8 characters
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: hasUpper && hasLower ? 'var(--success)' : 'var(--text-muted)' }}>
                {hasUpper && hasLower ? <Check size={14} /> : <X size={14} />} Upper & lower case letters
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: hasNumber ? 'var(--success)' : 'var(--text-muted)' }}>
                {hasNumber ? <Check size={14} /> : <X size={14} />} At least one number
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting || !hasMinLength || !isMatch}
              className="btn-primary"
              style={{ width: '100%', padding: '15px' }}
            >
              {submitting ? (
                <><Loader2 size={18} className="animate-spin" /> Creating Account...</>
              ) : (
                <>Complete Registration <ShieldCheck size={18} /></>
              )}
            </motion.button>
          </form>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};
