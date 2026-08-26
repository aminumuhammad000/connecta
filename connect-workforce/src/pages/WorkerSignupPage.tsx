import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { authAPI } from '../api/workforce';
import { Eye, EyeOff, Loader2, Building2 } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

export const WorkerSignupPage: React.FC = () => {
  const { signupWorker } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const workforceId = searchParams.get('workforceId') || searchParams.get('companyId') || '';

  const [companyName, setCompanyName] = useState<string>('');
  const [loadingCompany, setLoadingCompany] = useState<boolean>(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (workforceId) {
      fetchWorkforceCompany();
    }
  }, [workforceId]);

  const fetchWorkforceCompany = async () => {
    setLoadingCompany(true);
    try {
      const res = await authAPI.getPublicWorkforceInfo(workforceId);
      if (res?.data?.companyName) {
        setCompanyName(res.data.companyName);
      }
    } catch (err) {
      console.error('Failed to fetch workforce company name:', err);
    } finally {
      setLoadingCompany(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !identifier || !password) {
      showToast('Please fill out all required fields', 'error');
      return;
    }

    if (!agreedTerms) {
      showToast('Please agree to the Terms & Conditions to proceed', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const isEmail = identifier.includes('@');
      const email = isEmail ? identifier.trim().toLowerCase() : `${identifier.replace(/\D/g, '')}@worker.myconnecta.ng`;
      const phoneNumber = isEmail ? '' : identifier.trim();

      const success = await signupWorker({
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
        workforceId,
      });

      if (success) {
        showToast('Account created successfully! Welcome to Connecta.', 'success');
        navigate('/workforce/me');
      } else {
        showToast('Registration failed. Email or Phone may already be registered.', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Signup failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const displayCompanyName = companyName || 'your employer';

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans text-gray-900">
      {/* LEFT SIDE: Clean Worker Signup Form */}
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
              Create account
            </h1>
            <p className="text-sm font-medium text-gray-500">Enter your details to get started as a worker.</p>
          </div>

          {/* Employer Workforce Invitation Banner */}
          {workforceId && (
            <div className="bg-[#FD6730] text-white p-4.5 rounded-2xl flex items-center gap-3.5 shadow-lg shadow-primary/20 border border-orange-400">
              <div className="w-11 h-11 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="font-black text-xs uppercase tracking-wider text-orange-100">Workforce Invitation</div>
                <div className="text-sm font-extrabold text-white">
                  You are joining <span className="underline decoration-white/60">{displayCompanyName}</span> workforce roster directly
                </div>
              </div>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">First Name</label>
                <input
                  type="text"
                  required
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">Last Name</label>
                <input
                  type="text"
                  required
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

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
                  placeholder="Create password"
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

            {/* Terms Checkbox */}
            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-gray-600 font-medium cursor-pointer select-none">
                I agree to the <span className="font-bold underline text-primary">Terms & Condition</span> and <span className="font-bold underline text-primary">Privacy Policy</span>.
              </label>
            </div>

            {/* Sign Up Button (Connecta Theme Color #FD6730) */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign Up</span>}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-2 text-xs font-medium text-gray-600">
            Have account?{' '}
            <Link to="/login" className="font-bold underline text-primary hover:text-primary-hover">
              Sign In
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-gray-400 font-medium">
          © {new Date().getFullYear()} Connecta Workforce Ecosystem.
        </div>
      </div>

      {/* RIGHT SIDE: Minimalist WORKER 2D Illustration Panel */}
      <div className="hidden lg:flex flex-1 bg-[#09090b] text-white p-8 lg:p-12 flex-col justify-center items-center relative overflow-hidden border-l border-gray-800/60">
        {/* Minimal Subtle Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        {/* 2D Vector Illustration Container */}
        <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center space-y-6">
          <div className="relative rounded-3xl overflow-hidden border border-gray-800/80 shadow-2xl bg-[#121215] group">
            <img
              src="/worker_illustration.jpg"
              alt="Connecta Worker Shift Check-in Illustration"
              className="w-full h-auto object-cover max-h-[520px] transform group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          <div className="space-y-1.5">
            <h3 className="font-extrabold text-lg text-white tracking-tight">Smart Shift & Payroll Management</h3>
            <p className="text-xs text-gray-400 font-medium max-w-xs mx-auto leading-relaxed">
              Check into daily site shifts, track contracts, and get paid on time seamlessly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
