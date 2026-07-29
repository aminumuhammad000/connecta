import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MessageSquare, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { PageArtwork } from '../../components/common/PageArtwork';
import { authAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

export const SignupPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const roleQuery = (searchParams.get('role') as 'client' | 'freelancer') || 'freelancer';
  const navigate = useNavigate();
  const { error: toastError } = useToast();

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

  const [emailChecking, setEmailChecking] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [emailErrorMsg, setEmailErrorMsg] = useState('');
  const [phoneStatus, setPhoneStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

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

  const handlePhoneBlur = async () => {
    if (!formData.phoneNumber) return;
    try {
      const res = await authAPI.checkPhone(formData.phoneNumber);
      if (res.success) {
        setPhoneStatus('valid');
      } else {
        setPhoneStatus('invalid');
      }
    } catch {
      setPhoneStatus('idle');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toastError('Required Fields Missing', 'Please fill in First Name, Last Name, and Email');
      return;
    }

    if (emailStatus === 'invalid') {
      toastError('Invalid Email', emailErrorMsg || 'Please use a unique email address');
      return;
    }

    sessionStorage.setItem('signup_step1', JSON.stringify({
      ...formData,
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
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-primary)' }}>
              Create Account
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Fill in your details below
            </p>
          </div>

          {/* Minimalist Form */}
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
                    placeholder="Umar"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Email Address */}
            <div className="form-group">
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
                <div className="error-text">
                  <AlertCircle size={13} /> {emailErrorMsg}
                </div>
              )}
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
                  onBlur={handlePhoneBlur}
                  className={`input-field ${phoneStatus === 'valid' ? 'input-success' : ''}`}
                />
              </div>
            </div>

            {/* WhatsApp Number (Optional) */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.82rem' }}>WhatsApp (Optional)</label>
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
              Continue <ArrowRight size={18} />
            </motion.button>
          </form>

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
