import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { PageArtwork } from '../../components/common/PageArtwork';
import { GoogleAuthButton } from '../../components/common/GoogleAuthButton';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { isProfileComplete, getProfileSetupRoute } from '../../utils/userProfile';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isExpired = searchParams.get('expired') === '1';
  const navigate = useNavigate();
  const { login, user, isAuthenticated } = useAuth();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (isProfileComplete(user)) {
        if (user.userType === 'client') {
          navigate('/client/dashboard', { replace: true });
        } else {
          navigate('/freelancer/dashboard', { replace: true });
        }
      } else {
        navigate(getProfileSetupRoute(user), { replace: true });
      }
      return;
    }

    if (isExpired) {
      toastInfo('Session Expired', 'Please sign in again to continue');
    }
  }, [isAuthenticated, user, isExpired, navigate, toastInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toastError('Missing Fields', 'Please enter your email and password');
      return;
    }

    setSubmitting(true);
    try {
      const loggedUser = await login(email, password);
      toastSuccess('Welcome Back!', `Signed in as ${loggedUser.firstName}`);

      if (isProfileComplete(loggedUser)) {
        if (loggedUser.userType === 'client') {
          navigate('/client/dashboard');
        } else {
          navigate('/freelancer/dashboard');
        }
      } else {
        navigate(getProfileSetupRoute(loggedUser));
      }
    } catch (err: any) {
      toastError('Sign In Failed', err.response?.data?.message || err.message || 'Invalid email or password');
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
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>
              Welcome back
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Sign in to your account
            </p>
          </div>

          {/* Session Expired Banner */}
          {isExpired && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'rgba(234, 67, 53, 0.1)',
              border: '1px solid rgba(234, 67, 53, 0.3)',
              color: '#ea4335',
              fontSize: '0.88rem',
              marginBottom: '24px',
              fontWeight: 500
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>Your session has expired. Please sign in again.</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
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

            {/* Password */}
            <div className="form-group">
              <div className="form-label">
                <span>Password</span>
                <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                  Forgot password?
                </Link>
              </div>
              <div className="input-wrapper">
                <Lock className="input-icon-left" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
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
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ width: '100%', padding: '15px', marginTop: '8px' }}
            >
              {submitting ? (
                <><Loader2 size={18} className="animate-spin" /> Signing In...</>
              ) : (
                <>Sign In <LogIn size={18} /></>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '28px 0',
            color: 'var(--text-muted)',
            fontSize: '0.85rem'
          }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
            <span>OR CONTINUING WITH</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          </div>

          {/* Google Sign In Button */}
          <GoogleAuthButton mode="signin" />

          {/* Registration Footer Link */}
          <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Don't have an account yet?{' '}
            <Link to="/register/role" style={{ fontWeight: 700, color: 'var(--primary)' }}>
              Create Account
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};
