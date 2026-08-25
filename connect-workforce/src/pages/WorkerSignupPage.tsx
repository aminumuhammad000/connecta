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

      {/* RIGHT SIDE: Tailored WORKER Artwork & Testimonial Panel */}
      <div className="hidden lg:flex flex-1 bg-[#09090b] text-white p-12 lg:p-16 flex-col justify-between relative overflow-hidden border-l border-gray-800">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        {/* Worker Testimonial Quote */}
        <div className="relative z-10 max-w-lg pt-12 space-y-6">
          <p className="text-xl lg:text-2xl font-normal leading-relaxed text-gray-200">
            “Connecta makes it easy for me to check into my daily site shifts, track my work contracts, and receive my payroll earnings on time without stress.”
          </p>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/40 bg-gray-800 flex items-center justify-center text-white font-extrabold text-base">
              KA
            </div>
            <div>
              <div className="font-bold text-base text-white">Kemi Adebayo</div>
              <div className="text-xs font-medium text-gray-400">Certified Site Specialist</div>
            </div>
          </div>
        </div>

        {/* Tailored Worker UI Mockup Card */}
        <div className="relative z-10 pt-8 pl-12 -mr-16">
          <div className="bg-[#121215] border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-5 text-gray-300 font-sans transform rotate-1 scale-95 opacity-90 hover:opacity-100 transition-all">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Connecta Logo" className="h-7 w-auto object-contain" />
                <div>
                  <div className="text-xs text-gray-400 font-medium">👋 Morning, Kemi</div>
                  <div className="font-black text-sm text-white">My Worker Space</div>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                ● Shift Checked In
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#18181c] p-4 rounded-2xl border border-gray-800">
                <span className="text-[10px] font-bold text-gray-500 uppercase">This Month's Earnings</span>
                <div className="text-2xl font-black text-primary mt-1">₦185,000</div>
              </div>
              <div className="bg-[#18181c] p-4 rounded-2xl border border-gray-800">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Today's Shift</span>
                <div className="text-sm font-bold text-emerald-400 mt-1">Airport Road Site</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
