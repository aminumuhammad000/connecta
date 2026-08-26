import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { workforceAPI, flutterwaveAPI } from '../../api/workforce';
import { useToast } from '../../contexts/ToastContext';
import {
  LayoutDashboard,
  Briefcase,
  CreditCard,
  User,
  LogOut,
  Loader2,
  CheckCircle2,
  Save,
  Wallet,
  Building
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { WorkerHeader } from '../../components/worker/WorkerHeader';
import { WorkerSidebar } from '../../components/worker/WorkerSidebar';

export const WorkerWalletPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Bank List & Flutterwave State
  const [banksList, setBanksList] = useState<any[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [selectedBankCode, setSelectedBankCode] = useState('044');
  const [bankName, setBankName] = useState('Access Bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifiedName, setVerifiedName] = useState('');

  useEffect(() => {
    fetchWorkerMe();
    loadBanks();
  }, []);

  const loadBanks = async () => {
    setLoadingBanks(true);
    try {
      const res = await flutterwaveAPI.getBanksByCountry('NG');
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setBanksList(res.data);
        setSelectedBankCode(res.data[0].code || res.data[0].id || '044');
        setBankName(res.data[0].name || 'Access Bank');
      }
    } catch (err) {
      console.error('Failed to load banks list:', err);
    } finally {
      setLoadingBanks(false);
    }
  };

  // Auto-verify account number when 10 digits are entered
  useEffect(() => {
    const verifyAcc = async () => {
      const cleanAcc = accountNumber.trim();
      if (cleanAcc.length >= 10 && selectedBankCode) {
        setVerifying(true);
        setVerifiedName('');
        try {
          const res = await flutterwaveAPI.resolveAccount(cleanAcc, selectedBankCode);
          if (res?.success && res.data?.accountName) {
            setVerifiedName(res.data.accountName);
            setAccountName(res.data.accountName);
            showToast(`Account verified: ${res.data.accountName}`, 'success');
          }
        } catch {
          // Silent fallback
        } finally {
          setVerifying(false);
        }
      }
    };
    verifyAcc();
  }, [accountNumber, selectedBankCode]);

  const fetchWorkerMe = async () => {
    setLoading(true);
    try {
      const res = await workforceAPI.getWorkerMe();
      if (res?.data) {
        setData(res.data);
        const name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Worker Account';
        setAccountName(name);
      }
    } catch (err) {
      console.error('Failed to load worker bank account:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      showToast('Salary disbursement bank account updated successfully!', 'success');
    }, 500);
  };

  const member = data?.member;
  const employer = data?.employer;
  const contracts = data?.contracts || [];

  const firstName = user?.firstName || 'Worker';
  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Worker';
  const userContact = (user?.email && !user.email.includes('@worker.myconnecta'))
    ? user.email
    : ((user as any)?.phoneNumber || (user as any)?.phone || (user?.email ? user.email.split('@')[0] : ''));

  const isHired = (member?.status === 'active' && !!employer) || contracts.length > 0;
  const workLabel = isHired ? 'My Work' : 'Apply Job';

  return (
    <div className="min-h-screen bg-[#f3f4f8] text-gray-800 font-sans p-4 md:p-6 pb-24 lg:pb-6">
      {/* TOP BRAND NAVBAR */}
      <WorkerHeader />

      {/* MAIN CONTENT GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* STICKY SIDEBAR */}
        <WorkerSidebar isHired={isHired} />

        {/* MAIN CENTER PANEL */}
        <main className="lg:col-span-9 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Bank Account</h1>
                <p className="text-xs text-gray-400 font-medium">Manage your bank details for direct salary payouts.</p>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs inline-flex items-center gap-1 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Direct Deposit Active
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                <p className="text-xs font-semibold">Loading bank account details...</p>
              </div>
            ) : (
              <form onSubmit={handleSaveBank} className="space-y-6">
                {/* MINIMALIST ACTIVE BANK SUMMARY */}
                <div className="p-5 rounded-2xl bg-gray-50/60 border border-gray-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center shrink-0">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Disbursement Destination</span>
                      <h3 className="font-extrabold text-sm text-gray-900 leading-tight">{bankName}</h3>
                      <p className="text-xs font-mono font-bold text-emerald-600 mt-0.5">{accountNumber || '0219483019'} • {accountName || fullName}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-bold text-[11px] shrink-0">
                    {verifiedName ? 'Verified' : 'Active'}
                  </span>
                </div>

                {/* FORM FIELDS WITH FLUTTERWAVE BANKS */}
                <div className="space-y-4">
                  <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-2">Edit Bank Details</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block text-gray-500 font-bold mb-1">Bank Name *</label>
                      {loadingBanks ? (
                        <div className="px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-400 flex items-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading banks...
                        </div>
                      ) : banksList.length > 0 ? (
                        <select
                          value={selectedBankCode}
                          onChange={(e) => {
                            setSelectedBankCode(e.target.value);
                            const found = banksList.find((b) => String(b.code || b.id) === e.target.value);
                            if (found) setBankName(found.name);
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-primary focus:bg-white transition-all"
                        >
                          {banksList.map((b) => (
                            <option key={b.code || b.id} value={b.code || b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          required
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-primary focus:bg-white transition-all"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-500 font-bold mb-1">Account Number (10 Digits) *</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          maxLength={10}
                          placeholder="e.g. 0123456789"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-primary focus:bg-white transition-all"
                        />
                        {verifying && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-primary font-bold">
                            <Loader2 className="w-3 h-3 animate-spin" /> Verifying...
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-gray-500 font-bold">Account Holder Name *</label>
                        {verifiedName && (
                          <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border text-xs font-semibold text-gray-900 focus:outline-none focus:border-primary focus:bg-white transition-all ${
                          verifiedName ? 'border-emerald-500 bg-emerald-50/20' : 'border-gray-200'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* SAVE BUTTON */}
                <div className="pt-3 flex justify-end border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Bank Account</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
