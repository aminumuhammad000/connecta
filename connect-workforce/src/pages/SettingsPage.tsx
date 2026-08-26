import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { workforceAPI } from '../api/workforce';
import { useToast } from '../contexts/ToastContext';
import { EmployerHeader } from '../components/employer/EmployerHeader';
import { EmployerSidebar } from '../components/employer/EmployerSidebar';
import { EmployerMobileNavbar } from '../components/employer/EmployerMobileNavbar';
import {
  User,
  Building2,
  Save,
  MapPin,
  Loader2,
  CreditCard,
  Mail,
  Phone,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Briefcase
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'company' | 'bank' | 'rules'>('overview');

  // Employer Profile Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [rcNumber, setRcNumber] = useState('');
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('');

  // Settlement Bank Fields
  const [bankName, setBankName] = useState('Guaranty Trust Bank (GTBank)');
  const [accountNumber, setAccountNumber] = useState('0123948571');
  const [accountName, setAccountName] = useState('PAYFLOW LOGISTICS NIGERIA LTD');

  // Governance Settings
  const [requireLocation, setRequireLocation] = useState(true);
  const [allowSelfCheckIn, setAllowSelfCheckIn] = useState(true);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || 'Tunde');
      setLastName(user.lastName || 'Bakare');
      setEmail(user.email || 'tunde@payflow.ng');
      setPhone(user.phone || '+234 803 123 4567');
      setCompanyName(user.companyName || user.title || 'PayFlow Financial & Logistics');
      setRcNumber('RC-8492041');
      setLocation(user.location || 'Ikeja, Lagos, Nigeria');
      setIndustry('Fintech & Logistics Operations');
    }
    fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await workforceAPI.getSettings();
      if (res?.data) {
        setRequireLocation(res.data.requireLocationForAttendance || false);
        setAllowSelfCheckIn(res.data.allowSelfCheckIn ?? true);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await workforceAPI.saveSettings({
        requireLocationForAttendance: requireLocation,
        allowSelfCheckIn,
        defaultCurrency: 'NGN',
      });
      showToast('Profile and workforce settings saved successfully!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save profile settings', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const fullName = `${firstName} ${lastName}`.trim();

  return (
    <div className="min-h-screen bg-[#f3f4f8] text-gray-800 font-sans p-4 md:p-6 pb-24 lg:pb-6">
      {/* TOP BRAND NAVBAR */}
      <EmployerHeader />

      {/* MAIN CONTENT GRID CONTAINER */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT SIDEBAR */}
        <EmployerSidebar />

        {/* CENTER CONTENT */}
        <main className="lg:col-span-9 space-y-6">
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
              <p className="text-xs font-semibold">Loading profile settings...</p>
            </div>
          ) : (
            <>
              {/* Header Profile Card (Identical to Worker Profile Header) */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-orange-100 text-primary font-black text-xl flex items-center justify-center overflow-hidden shrink-0">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt={fullName} className="w-full h-full object-cover" />
                    ) : (
                      (fullName || 'E')[0]
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">{fullName}</h1>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[11px] inline-flex items-center gap-1 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Verified Employer
                      </span>
                    </div>
                    <div className="text-xs font-medium text-gray-400 flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1 font-bold text-gray-700"><Building2 className="w-3.5 h-3.5 text-primary" /> {companyName}</span>
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-gray-400" /> {email}</span>
                      {phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-gray-400" /> {phone}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => logout()}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-rose-50 font-bold text-xs text-gray-600 hover:text-rose-600 border border-gray-200 hover:border-rose-200 transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5 text-gray-400" />
                    <span>Log Out</span>
                  </button>

                  <button
                    onClick={handleSave}
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover font-bold text-xs text-white shadow-xs transition-all disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>

              {/* Minimalist Sub-Tabs Bar (Identical to Worker Profile Tabs) */}
              <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-xs space-y-4">
                <div className="flex border-b border-gray-100 font-bold text-xs gap-6">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'company', label: 'Company & Business' },
                    { id: 'bank', label: 'Settlement Bank' },
                    { id: 'rules', label: 'Attendance Rules' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`pb-3 capitalize transition-all border-b-2 ${
                        activeTab === tab.id
                          ? 'border-primary text-primary font-extrabold'
                          : 'border-transparent text-gray-400 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab 1: Overview */}
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="bg-gray-50/60 rounded-2xl p-5 border border-gray-100 space-y-3">
                      <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-2">Employer Identity</h3>
                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-medium">Full Name</span>
                          <span className="font-bold text-gray-900">{fullName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-medium">Email Address</span>
                          <span className="font-bold text-gray-900">{email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-medium">Phone Number</span>
                          <span className="font-bold text-gray-900">{phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-medium">Account Status</span>
                          <span className="font-extrabold text-emerald-600">Active Verified Employer</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50/60 rounded-2xl p-5 border border-gray-100 space-y-3">
                      <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-2">Corporate Summary</h3>
                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-medium">Company Name</span>
                          <span className="font-bold text-gray-900">{companyName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-medium">RC Registration</span>
                          <span className="font-mono font-bold text-gray-900">{rcNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-medium">Office Location</span>
                          <span className="font-bold text-gray-900">{location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-medium">Settlement Bank</span>
                          <span className="font-bold text-emerald-600">{bankName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Company & Business Form */}
                {activeTab === 'company' && (
                  <form onSubmit={handleSave} className="space-y-4 pt-2">
                    <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-2">Business Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-gray-500 font-bold mb-1">Company / Organization *</label>
                        <input
                          type="text"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-primary focus:bg-white transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 font-bold mb-1">CAC Registration / RC Number</label>
                        <input
                          type="text"
                          value={rcNumber}
                          onChange={(e) => setRcNumber(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-primary focus:bg-white transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 font-bold mb-1">Office Address & Location *</label>
                        <input
                          type="text"
                          required
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-primary focus:bg-white transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 font-bold mb-1">Industry / Sector</label>
                        <input
                          type="text"
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-primary focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  </form>
                )}

                {/* Tab 3: Settlement Bank Form */}
                {activeTab === 'bank' && (
                  <form onSubmit={handleSave} className="space-y-4 pt-2">
                    <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-2">Settlement Bank Account</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block text-gray-500 font-bold mb-1">Bank Name</label>
                        <input
                          type="text"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-primary focus:bg-white transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 font-bold mb-1">Account Number</label>
                        <input
                          type="text"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-primary focus:bg-white transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 font-bold mb-1">Account Name</label>
                        <input
                          type="text"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-primary focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  </form>
                )}

                {/* Tab 4: Attendance Rules */}
                {activeTab === 'rules' && (
                  <form onSubmit={handleSave} className="space-y-3 pt-2">
                    <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-2">Site Attendance Rules</h3>
                    <div className="space-y-2 text-xs">
                      <label className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={requireLocation}
                          onChange={(e) => setRequireLocation(e.target.checked)}
                          className="w-4 h-4 rounded text-primary focus:ring-0"
                        />
                        <div>
                          <span className="font-bold text-gray-900 block">Require GPS Location Check-In</span>
                          <span className="text-[11px] text-gray-400 font-medium">Workers must share location when checking in to verify site presence.</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={allowSelfCheckIn}
                          onChange={(e) => setAllowSelfCheckIn(e.target.checked)}
                          className="w-4 h-4 rounded text-primary focus:ring-0"
                        />
                        <div>
                          <span className="font-bold text-gray-900 block">Enable 1-Tap Daily Check-In</span>
                          <span className="text-[11px] text-gray-400 font-medium">Workers can log daily attendance check-in directly from their portal.</span>
                        </div>
                      </label>
                    </div>
                  </form>
                )}
              </div>
            </>
          )}
        </main>
      </div>
      <EmployerMobileNavbar />
    </div>
  );
};
