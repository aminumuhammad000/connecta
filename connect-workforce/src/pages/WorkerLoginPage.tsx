import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WorkerLoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      showToast('Please enter your email or phone number and password', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const isEmail = identifier.includes('@');
      const loginPayload = isEmail ? identifier.trim().toLowerCase() : identifier.trim();

      const success = await login(loginPayload, password);
      if (success) {
        showToast('Welcome back to Connecta!', 'success');
        window.location.href = '/workforce/me';
      } else {
        showToast('Invalid credentials. Please check your email/phone and password.', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Login failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans text-gray-900">
      {/* LEFT SIDE: Minimalist Worker Login Form */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 max-w-xl mx-auto lg:mx-0 w-full">
        {/* Brand Logo Header (Real Connecta Logo) */}
        <div className="flex items-center gap-3 mb-8">
          <img src="/connecta_logo.png" alt="Connecta Logo" className="h-9 w-auto object-contain" />
        </div>

        {/* Form Container */}
        <div className="my-auto py-6 space-y-6">
          {/* Minimalist Greeting */}
          <div className="text-center sm:text-left space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm font-medium text-gray-500">Enter your credentials to sign in.</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email or Phone Number */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center justify-between">
                <span>Email or Phone Number</span>
                <span className="text-[11px] font-medium text-gray-400">e.g. 08012345678 or name@example.com</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter email or phone number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            {/* Password Field with Show/Hide Toggle */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 font-bold text-xs flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
            </div>

            {/* Submit Button (Connecta Theme Color #FD6730) */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-2 text-xs font-medium text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold underline text-primary hover:text-primary-hover">
              Sign Up
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-gray-400 font-medium">
          © {new Date().getFullYear()} Connecta Workforce Ecosystem.
        </div>
      </div>

      {/* RIGHT SIDE: Minimalist WORKER 2D Illustration Panel */}
      <div className="hidden lg:flex flex-1 bg-[#09090b] text-white p-4 lg:p-6 flex-col justify-center items-center relative overflow-hidden border-l border-gray-800/60">
        {/* Minimal Subtle Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        {/* 2D Vector Illustration Container */}
        <div className="relative z-10 w-full max-w-xl flex flex-col items-center text-center space-y-4">
          <div className="w-full flex justify-center">
            <img
              src="/worker_illustration.jpg"
              alt="Connecta Workforce Illustration"
              className="w-full h-auto object-contain max-h-[720px]"
            />
          </div>

          <div className="space-y-1">
            <h3 className="font-extrabold text-xl text-white tracking-tight">Connect with Verified Employers</h3>
            <p className="text-xs text-gray-400 font-medium max-w-md mx-auto leading-relaxed">
              Find jobs, manage work contracts, track daily shifts, and get paid directly with peace of mind.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
