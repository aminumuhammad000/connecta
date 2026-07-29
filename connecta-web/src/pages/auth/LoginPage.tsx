import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { PageArtwork } from '../../components/common/PageArtwork';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isExpired = searchParams.get('expired') === '1';
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (isExpired) {
      toastInfo('Session Expired', 'Please sign in again to continue');
    }
  }, [isExpired, toastInfo]);

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

      if (loggedUser.userType === 'client') {
        navigate('/client/dashboard');
      } else {
        navigate('/freelancer/dashboard');
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
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>
              Welcome back
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Sign in to your account
            </p>
          </div>

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
          <button
            type="button"
            onClick={() => toastInfo('Google OAuth', 'Google sign in integration ready')}
            className="btn-secondary"
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Sign in with Google
          </button>

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
