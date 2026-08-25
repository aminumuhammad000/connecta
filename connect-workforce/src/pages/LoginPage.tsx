import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Building2, ArrowRight, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter your email and password', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const success = await login(email, password);
      if (success) {
        showToast('Welcome back to Connecta Workforce Management!', 'success');
        window.location.href = '/dashboard';
      } else {
        showToast('Invalid credentials. Please check your email and password.', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Login failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-gray-200 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white font-black text-2xl mx-auto mb-3 shadow-lg shadow-primary/25">
            W
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-extrabold text-xs mb-2">
            <Building2 className="w-3.5 h-3.5 text-primary" /> Employer Portal
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Employer Sign In</h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Access workforce management, attendance tracking, and payroll.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Employer Email</label>
            <input
              type="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 font-semibold text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 font-semibold text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm transition-all shadow-md shadow-primary/25 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In to Employer Portal</span>}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-400">Connecta Workforce Management Platform</span>
        </div>
      </div>
    </div>
  );
};
