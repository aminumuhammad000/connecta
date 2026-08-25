import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { workforceAPI } from '../../api/workforce';
import { useToast } from '../../contexts/ToastContext';
import {
  LayoutDashboard,
  Briefcase,
  CreditCard,
  User,
  LogOut,
  Loader2,
  Building2,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Save,
  Phone,
  Building,
  ArrowRight
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { WorkerHeader } from '../../components/worker/WorkerHeader';

export const WorkerProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Bank Cashout Details State
  const [bankName, setBankName] = useState('Guaranty Trust Bank (GTBank)');
  const [accountNumber, setAccountNumber] = useState('0219483019');
  const [accountName, setAccountName] = useState('');

  useEffect(() => {
    fetchWorkerMe();
  }, []);

  const fetchWorkerMe = async () => {
    setLoading(true);
    try {
      const res = await workforceAPI.getWorkerMe();
      if (res?.data) {
        setData(res.data);
        const name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Worker';
        setAccountName(name);
      }
    } catch (err) {
      console.error('Failed to load worker profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      showToast('Bank cashout account details saved successfully!', 'success');
    }, 600);
  };

  const member = data?.member;
  const employer = data?.employer;
  const contracts = data?.contracts || [];

  const firstName = user?.firstName || 'Worker';
  const lastName = user?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Worker';
  const userContact = (user?.email && !user.email.includes('@worker.myconnecta'))
    ? user.email
    : ((user as any)?.phoneNumber || (user as any)?.phone || (user?.email ? user.email.split('@')[0] : ''));

  const employerName = employer
    ? (employer.companyName || employer.title || `${employer.firstName || ''} ${employer.lastName || ''}`.trim())
    : 'Not Hired Yet';

  const isHired = (member?.status === 'active' && !!employer) || contracts.length > 0;
  const workLabel = isHired ? 'My Work' : 'Apply Job';

  return (
    <div className="min-h-screen bg-[#f3f4f8] text-gray-800 font-sans p-4 md:p-6 pb-24 lg:pb-6">
      {/* TOP BRAND NAVBAR */}
      <WorkerHeader />

      {/* MAIN CONTENT GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT SIDEBAR (Desktop Only) */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col justify-between space-y-8 pr-2">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-orange-100 border-2 border-white shadow-sm flex items-center justify-center text-primary font-extrabold text-lg overflow-hidden">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={fullName} className="w-full h-full object-cover" />
                  ) : (
                    (firstName || 'W')[0]
                  )}
                </div>
                <span className={`w-3.5 h-3.5 rounded-full border-2 border-white absolute bottom-0 right-0 ${isHired ? 'bg-emerald-500' : 'bg-amber-400'}`} />
              </div>

              <div>
                <h2 className="font-extrabold text-gray-900 text-base leading-tight">Hello, {firstName}</h2>
                <p className="text-xs text-gray-500 font-medium truncate max-w-[170px]">{userContact}</p>
              </div>
            </div>

            <nav className="space-y-2">
              <Link
                to="/workforce/me"
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
                  location.pathname === '/workforce/me' ? 'bg-white text-gray-900 font-extrabold shadow-xs border border-gray-100' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <LayoutDashboard className={`w-5 h-5 ${location.pathname === '/workforce/me' ? 'text-primary' : ''}`} />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/workforce/me/jobs"
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
                  location.pathname.includes('/jobs') ? 'bg-white text-gray-900 font-extrabold shadow-xs border border-gray-100' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Briefcase className={`w-5 h-5 ${location.pathname.includes('/jobs') ? 'text-primary' : ''}`} />
                <span>{workLabel}</span>
              </Link>

              <Link
                to="/workforce/me/payments"
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
                  location.pathname.includes('/payments') ? 'bg-white text-gray-900 font-extrabold shadow-xs border border-gray-100' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <CreditCard className={`w-5 h-5 ${location.pathname.includes('/payments') ? 'text-emerald-600' : ''}`} />
                <span>My Salary</span>
              </Link>

              <Link
                to="/workforce/me/profile"
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
                  location.pathname.includes('/profile') ? 'bg-white text-gray-900 font-extrabold shadow-xs border border-gray-100' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <User className={`w-5 h-5 ${location.pathname.includes('/profile') ? 'text-primary' : ''}`} />
                <span>My Profile</span>
              </Link>
            </nav>
          </div>

          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 text-gray-500 hover:text-rose-600 font-semibold text-sm transition-all text-left border-t border-gray-200/60 pt-6"
          >
            <LogOut className="w-5 h-5" />
            <span>Log out</span>
          </button>
        </aside>

        {/* MAIN CENTER PANEL */}
        <main className="lg:col-span-9 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Worker Profile & Cashout Setup</h1>
                <p className="text-xs text-gray-400 font-medium">Manage your personal info and salary payout bank account.</p>
              </div>

              <button
                onClick={() => logout()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-rose-50 text-gray-600 hover:text-rose-600 font-bold text-xs border border-gray-200 transition-all self-start sm:self-auto"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                <p className="text-xs font-semibold">Loading profile details...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 1. PERSONAL DETAILS */}
                <div className="bg-gray-50/60 rounded-2xl p-5 border border-gray-100 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-900 flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" /> Personal Information
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[11px] inline-flex items-center gap-1 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Verified Worker
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-400 font-bold block mb-1">Full Name</span>
                      <span className="font-extrabold text-gray-900 text-sm">{fullName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-bold block mb-1">Contact Email / Handle</span>
                      <span className="font-extrabold text-gray-900 text-sm">{userContact}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-bold block mb-1">Assigned Role</span>
                      <span className="font-extrabold text-gray-900 text-sm">{member?.role || 'Site Operator'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-bold block mb-1">Current Employer</span>
                      <span className="font-extrabold text-primary text-sm">{employerName}</span>
                    </div>
                  </div>
                </div>

                {/* 2. BANK CASHOUT SETUP FORM */}
                {/* 2. BANK CASHOUT LINK CARD */}
                <div className="bg-gray-50/60 rounded-2xl p-5 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-600" /> Bank Account for Salary Disbursements
                    </h3>
                    <p className="text-xs text-gray-500 font-medium mt-1">Configure your Nigerian bank account to receive direct employer salary payouts.</p>
                  </div>

                  <Link
                    to="/workforce/me/wallet"
                    className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto shrink-0"
                  >
                    <span>Manage Bank Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
