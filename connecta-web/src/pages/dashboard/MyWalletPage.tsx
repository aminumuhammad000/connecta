import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { motion } from 'framer-motion';
import {
  ShieldCheck, ArrowDownLeft, ArrowUpRight, ArrowRight, RefreshCw, Loader2,
  X, PlusCircle, Copy, Building2, CreditCard, Edit3, CheckCircle2,
} from 'lucide-react';
import { walletAPI, flutterwaveAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { SUPPORTED_CURRENCIES, type CurrencyCode } from '../../utils/currency';

// ---------------------------------------------------------------------------
// Country / bank options
// ---------------------------------------------------------------------------
const COUNTRY_OPTIONS = [
  { code: 'NG', name: '🇳🇬 Nigeria', currency: 'NGN' },
  { code: 'KE', name: '🇰🇪 Kenya', currency: 'KES' },
  { code: 'GH', name: '🇬🇭 Ghana', currency: 'GHS' },
  { code: 'UG', name: '🇺🇬 Uganda', currency: 'UGX' },
  { code: 'ZA', name: '🇿🇦 South Africa', currency: 'ZAR' },
  { code: 'US', name: '🇺🇸 United States / Global', currency: 'USD' },
];

// ---------------------------------------------------------------------------
// Payout Setup Page (full-page, no wallet content behind it)
// ---------------------------------------------------------------------------
interface PayoutSetupPageProps {
  userCurrency: string;
  currencySymbol: string;
  currencyConfig: { name: string; flag: string };
  userName: string;
  onSaved: () => void;
}

const PayoutSetupPage: React.FC<PayoutSetupPageProps> = ({
  userCurrency, currencySymbol, currencyConfig, userName, onSaved,
}) => {
  const { showToast } = useToast();

  // derive default country from currency
  const defaultCountry =
    userCurrency === 'USD' ? 'US' :
    userCurrency === 'KES' ? 'KE' :
    userCurrency === 'GHS' ? 'GH' :
    userCurrency === 'UGX' ? 'UG' :
    userCurrency === 'ZAR' ? 'ZA' : 'NG';

  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [banksList, setBanksList] = useState<any[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [selectedBankCode, setSelectedBankCode] = useState('');
  const [selectedBankName, setSelectedBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifiedName, setVerifiedName] = useState('');
  const [saving, setSaving] = useState(false);

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
          } else {
            showToast(res?.message || 'Could not verify account for selected bank.', 'error');
          }
        } catch (err: any) {
          const msg = err?.response?.data?.message || 'Could not resolve account details.';
          showToast(msg, 'error');
        } finally {
          setVerifying(false);
        }
      }
    };
    verifyAcc();
  }, [accountNumber, selectedBankCode]);

  /* submit handler unchanged below */

  const loadBanks = async (cCode: string) => {
    setLoadingBanks(true);
    try {
      const res = await flutterwaveAPI.getBanksByCountry(cCode);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setBanksList(res.data);
        setSelectedBankCode(res.data[0].code || res.data[0].id || '');
        setSelectedBankName(res.data[0].name || '');
      } else {
        setBanksList([]);
        setSelectedBankCode('');
        setSelectedBankName('');
      }
    } catch {
      setBanksList([]);
    } finally {
      setLoadingBanks(false);
    }
  };

  useEffect(() => { loadBanks(selectedCountry); }, [selectedCountry]);

  const handleCountryChange = (c: string) => {
    setSelectedCountry(c);
    setSelectedBankCode('');
    setSelectedBankName('');
    setBanksList([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim() || !selectedBankName.trim()) {
      showToast('Please complete all bank account fields.', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await walletAPI.saveWithdrawalSettings({
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
        bankName: selectedBankName,
        bankCode: selectedBankCode || '044',
      });
      if (res?.success) {
        showToast('Payout method saved! Accessing your wallet now…', 'success');
        onSaved();
      } else {
        showToast(res?.message || 'Failed to save payout method.', 'error');
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to save payout method.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{ width: '100%', maxWidth: '420px' }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Set Up Payout Method
            </h1>
          </div>

          {/* Form matching Signup Input UI */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* Bank or Provider */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.82rem' }}>
                Bank or Provider *
              </label>
              {loadingBanks ? (
                <div style={{
                  padding: '10px 14px', borderRadius: '10px',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)', fontSize: '0.84rem',
                  display: 'flex', alignItems: 'center', gap: '8px', height: '44px'
                }}>
                  <Loader2 size={16} className="animate-spin" color="var(--primary)" />
                  <span>Loading banks…</span>
                </div>
              ) : banksList.length > 0 ? (
                <select
                  value={selectedBankCode}
                  onChange={(e) => {
                    setSelectedBankCode(e.target.value);
                    const found = banksList.find((b) => String(b.code || b.id) === e.target.value);
                    if (found) setSelectedBankName(found.name);
                  }}
                  className="input-field"
                  style={{ width: '100%', height: '44px', fontWeight: 600, cursor: 'pointer' }}
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
                  placeholder="Enter Bank or Provider Name"
                  value={selectedBankName}
                  onChange={(e) => { setSelectedBankName(e.target.value); setSelectedBankCode('044'); }}
                  className="input-field"
                  style={{ width: '100%', height: '44px' }}
                />
              )}
            </div>

            {/* Account Number */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ fontSize: '0.82rem', margin: 0 }}>
                  Account Number *
                </label>
                {verifying && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    <Loader2 size={13} className="animate-spin" /> Verifying
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                maxLength={10}
                placeholder="Enter 10-digit account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
                className="input-field"
                style={{ width: '100%', height: '44px', letterSpacing: '0.04em' }}
              />
            </div>

            {/* Account Holder Name */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ fontSize: '0.82rem', margin: 0 }}>
                  Account Holder Name *
                </label>
                {verifiedName && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <CheckCircle2 size={13} /> Verified
                  </motion.span>
                )}
              </div>
              <input
                type="text"
                required
                placeholder="Enter Account Holder Name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className={`input-field ${verifiedName ? 'input-success' : ''}`}
                style={{ width: '100%', height: '44px' }}
              />
            </div>

            {/* Action Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={{
                width: '100%', padding: '14px', borderRadius: '12px',
                fontWeight: 700, fontSize: '0.96rem', marginTop: '6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              {saving ? (
                <><Loader2 size={18} className="animate-spin" /> Saving Method…</>
              ) : (
                <>Save & Access Wallet <ArrowRight size={18} /></>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

// ---------------------------------------------------------------------------
// Main Wallet Page
// ---------------------------------------------------------------------------
export const MyWalletPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { formatDualPrice } = useCurrency();
  const isFreelancer = user?.userType === 'freelancer';

  // Currency helpers
  const userCurrency = (user?.currency || 'USD').toUpperCase();
  const currencyConfig = SUPPORTED_CURRENCIES[userCurrency as CurrencyCode] || SUPPORTED_CURRENCIES.USD;
  const currencySymbol = currencyConfig.symbol;
  const userName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Valued User';

  // Core state
  const [wallet, setWallet] = useState<any | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingVirtualAcc, setGeneratingVirtualAcc] = useState(false);
  const [virtualAccount, setVirtualAccount] = useState<any | null>(null);

  // Deposit modal
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(
    ['USD', 'EUR', 'GBP'].includes(userCurrency) ? 100 : 10000
  );
  const [processingDeposit, setProcessingDeposit] = useState(false);

  // Withdrawal modal
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(
    ['USD', 'EUR', 'GBP'].includes(userCurrency) ? 50 : 5000
  );
  const [processingWithdraw, setProcessingWithdraw] = useState(false);

  // Payout settings modal (for editing after setup)
  const defaultCountryCode =
    userCurrency === 'USD' ? 'US' : userCurrency === 'KES' ? 'KE' :
    userCurrency === 'GHS' ? 'GH' : userCurrency === 'UGX' ? 'UG' :
    userCurrency === 'ZAR' ? 'ZA' : 'NG';

  const [showPayoutSettingsModal, setShowPayoutSettingsModal] = useState(false);
  const [settingsCountry, setSettingsCountry] = useState(defaultCountryCode);
  const [settingsBanksList, setSettingsBanksList] = useState<any[]>([]);
  const [settingsLoadingBanks, setSettingsLoadingBanks] = useState(false);
  const [settingsBankCode, setSettingsBankCode] = useState('');
  const [settingsBankName, setSettingsBankName] = useState('');
  const [settingsAccountNumber, setSettingsAccountNumber] = useState('');
  const [settingsAccountName, setSettingsAccountName] = useState(userName);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => { fetchWalletData(); }, []);

  useEffect(() => {
    if (showPayoutSettingsModal) loadSettingsBanks(settingsCountry);
  }, [settingsCountry, showPayoutSettingsModal]);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const [wRes, txRes] = await Promise.all([
        walletAPI.getWallet().catch(() => null),
        walletAPI.getTransactions().catch(() => null),
      ]);

      if (wRes?.success && wRes.data) {
        setWallet(wRes.data);
        const bd = wRes.data.bankDetails;
        if (bd?.accountNumber) {
          setSettingsAccountNumber(bd.accountNumber);
          setSettingsAccountName(bd.accountName || userName);
          setSettingsBankName(bd.bankName || '');
          setSettingsBankCode(bd.bankCode || '');
        }
      } else {
        setWallet({ balance: 0, escrowBalance: 0, availableBalance: 0 });
      }

      if (txRes?.success && Array.isArray(txRes.data)) {
        setTransactions(txRes.data);
      } else if (Array.isArray(txRes)) {
        setTransactions(txRes);
      } else {
        setTransactions([]);
      }
    } catch {
      setWallet({ balance: 0, escrowBalance: 0, availableBalance: 0 });
      setTransactions([]);
    } finally {
      setLoading(false);
    }

    // Non-blocking background fetch for virtual account details
    walletAPI.getVirtualAccount()
      .then((vtRes) => {
        if (vtRes?.success && vtRes.data) setVirtualAccount(vtRes.data);
      })
      .catch(() => null);
  };

  const loadSettingsBanks = async (cCode: string) => {
    setSettingsLoadingBanks(true);
    try {
      const res = await flutterwaveAPI.getBanksByCountry(cCode);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setSettingsBanksList(res.data);
        if (!settingsBankCode) {
          setSettingsBankCode(res.data[0].code || res.data[0].id || '');
          setSettingsBankName(res.data[0].name || '');
        }
      } else {
        setSettingsBanksList([]);
      }
    } catch {
      setSettingsBanksList([]);
    } finally {
      setSettingsLoadingBanks(false);
    }
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleGenerateVirtualAccount = async () => {
    setGeneratingVirtualAcc(true);
    try {
      const res = await walletAPI.getVirtualAccount();
      if (res?.success && res.data) {
        setVirtualAccount(res.data);
        showToast('Virtual account generated successfully!', 'success');
      } else {
        showToast(res?.message || 'Could not generate virtual account.', 'error');
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Virtual account generation pending.', 'info');
    } finally {
      setGeneratingVirtualAcc(false);
    }
  };

  const handleSavePayoutSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsAccountNumber || !settingsBankName) {
      showToast('Please fill in complete bank details.', 'error');
      return;
    }
    setSavingSettings(true);
    try {
      const res = await walletAPI.saveWithdrawalSettings({
        accountName: settingsAccountName,
        accountNumber: settingsAccountNumber,
        bankName: settingsBankName,
        bankCode: settingsBankCode || '044',
      });
      if (res?.success) {
        showToast('Payout method updated successfully!', 'success');
        setShowPayoutSettingsModal(false);
        await fetchWalletData();
      } else {
        showToast(res?.message || 'Failed to save.', 'error');
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to save payout method.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount <= 0) { showToast('Enter a valid deposit amount.', 'error'); return; }
    setProcessingDeposit(true);
    try {
      const res = await flutterwaveAPI.initializeDeposit(depositAmount, userCurrency);
      if (res?.data?.link) {
        window.location.href = res.data.link;
      } else {
        showToast(`Deposit initialized in ${userCurrency}!`, 'success');
        fetchWalletData();
        setShowDepositModal(false);
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to initialize deposit.', 'error');
    } finally {
      setProcessingDeposit(false);
    }
  };

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount <= 0) { showToast('Enter a valid withdrawal amount.', 'error'); return; }
    if (currentBalance <= 0 || withdrawAmount > currentBalance) {
      showToast(`Insufficient balance. Your available balance is ${currencySymbol}${currentBalance.toLocaleString()}.`, 'error');
      return;
    }
    const savedBank = wallet?.bankDetails;
    if (!savedBank?.accountNumber) {
      showToast('No saved payout method. Please update your payout settings first.', 'error');
      setShowWithdrawModal(false);
      setShowPayoutSettingsModal(true);
      return;
    }
    setProcessingWithdraw(true);
    try {
      await flutterwaveAPI.requestWithdrawal({
        amount: withdrawAmount,
        currency: userCurrency,
        bankCode: savedBank.bankCode || '044',
        accountNumber: savedBank.accountNumber,
        accountName: savedBank.accountName || userName,
      });
      setShowWithdrawModal(false);
      showToast(`Withdrawal of ${currencySymbol}${withdrawAmount.toLocaleString()} submitted to ${savedBank.bankName}!`, 'success');
      fetchWalletData();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to submit withdrawal.', 'error');
    } finally {
      setProcessingWithdraw(false);
    }
  };

  const getPresetAmounts = (curr: string) => {
    switch (curr) {
      case 'USD': case 'EUR': case 'GBP': return [50, 100, 250, 500];
      case 'KES': return [1000, 5000, 10000, 25000];
      case 'GHS': return [100, 500, 1000, 2500];
      case 'UGX': return [50000, 100000, 250000, 500000];
      case 'ZAR': return [250, 500, 1000, 2500];
      default: return [5000, 20000, 50000, 100000];
    }
  };

  // ── Loading Spinner ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
          <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary)' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading your wallet…</p>
        </div>
      </DashboardLayout>
    );
  }

  // ── GATE: Freelancers without a saved payout method see ONLY the setup page ─
  const hasSavedPayoutMethod = !!(wallet?.bankDetails?.accountNumber);
  if (isFreelancer && !hasSavedPayoutMethod) {
    return (
      <PayoutSetupPage
        userCurrency={userCurrency}
        currencySymbol={currencySymbol}
        currencyConfig={{ name: currencyConfig.name, flag: currencyConfig.flag }}
        userName={userName}
        onSaved={fetchWalletData}
      />
    );
  }

  // ── Main Wallet UI (only rendered after payout method is saved) ────────────
  const currentBalance = Number(wallet?.balance ?? wallet?.availableBalance ?? 0);
  const currentEscrow = Number(wallet?.escrowBalance ?? 0);
  const savedBankDetails = wallet?.bankDetails;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '100px' }}>
        {/* Minimalist Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px', letterSpacing: '-0.02em' }}>
              {isFreelancer ? 'Wallet & Payouts' : 'Client Funding & Escrow'}
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              Manage balances, escrow milestones, and bank payouts in {userCurrency}.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {isFreelancer ? (
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="btn-primary"
                style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <ArrowUpRight size={14} /> Withdraw ({currencySymbol})
              </button>
            ) : (
              <button
                onClick={() => setShowDepositModal(true)}
                className="btn-primary"
                style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <PlusCircle size={14} /> Fund Wallet ({currencySymbol})
              </button>
            )}
          </div>
        </div>

        {/* Wallet Stat Cards Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          {/* Balance */}
          <div style={{ padding: '16px 20px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}>
              {isFreelancer ? 'Available Balance' : 'Client Wallet'}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {formatDualPrice(currentBalance)}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--success)', marginTop: '4px', display: 'block', fontWeight: 600 }}>
              Ready for instant withdrawal
            </span>
          </div>

          {/* Escrow Card */}
          <div style={{ padding: '16px 20px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}>
              {isFreelancer ? 'Pending Escrow' : 'Active Escrow Milestones'}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {formatDualPrice(currentEscrow)}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={12} color="var(--primary)" /> Connecta Protected
            </span>
          </div>

          {/* Payout Method Card (Freelancers only) */}
          {isFreelancer && savedBankDetails?.accountNumber && (
            <div style={{ padding: '16px 20px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Payout Method</span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--success)', background: 'rgba(16,185,129,0.1)', padding: '1px 6px', borderRadius: '6px' }}>Verified</span>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {savedBankDetails.bankName} • {savedBankDetails.accountNumber.slice(-4)}
                </div>
              </div>
              <button
                onClick={() => setShowPayoutSettingsModal(true)}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', textAlign: 'left', padding: 0, marginTop: '6px' }}
              >
                Edit Payout Details →
              </button>
            </div>
          )}

          {/* Virtual Account Card (clients only) */}
          {!isFreelancer && (
            <div style={{ padding: '16px 20px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}>
                Virtual Bank Transfer
              </div>
              {virtualAccount ? (
                <>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--primary)' }}>
                    {virtualAccount.bankName || 'Wema Bank'} • {virtualAccount.accountNumber}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${virtualAccount.bankName} - ${virtualAccount.accountNumber}`);
                      showToast('Account details copied!', 'info');
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', padding: 0, marginTop: '4px' }}
                  >
                    Copy Details
                  </button>
                </>
              ) : (
                <button
                  onClick={handleGenerateVirtualAccount}
                  disabled={generatingVirtualAcc}
                  className="btn-primary"
                  style={{ padding: '6px 12px', fontSize: '0.76rem', borderRadius: '8px', fontWeight: 700, marginTop: '6px' }}
                >
                  Generate Account
                </button>
              )}
            </div>
          )}
        </div>

        {/* Transaction History Ledger */}
        <div style={{ padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Transaction History
            </h3>
            <button
              onClick={fetchWalletData}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 700 }}
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          {transactions.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              No transactions recorded yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {transactions.map((tx) => (
                <div
                  key={tx._id || tx.id || Math.random()}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: tx.type === 'deposit' ? 'rgba(16,185,129,0.1)' : 'rgba(253,103,48,0.1)', color: tx.type === 'deposit' ? 'var(--success)' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {tx.type === 'deposit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)' }}>{tx.description || tx.type || 'Wallet Activity'}</div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'Recent'}</span>
                    </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: tx.type === 'deposit' ? 'var(--success)' : 'var(--text-primary)' }}>
                  {tx.type === 'deposit' ? '+' : '-'}{formatDualPrice(Number(tx.amount || 0))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Deposit Modal ──────────────────────────────────────────────────────── */}
      {showDepositModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={() => setShowDepositModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'var(--card-bg)', borderRadius: '24px', padding: '24px 20px', maxWidth: '460px', width: '100%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-color)', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', position: 'relative' }}
          >
            <button onClick={() => setShowDepositModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>Fund Wallet ({userCurrency})</h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Deposit into your secure escrow wallet via Flutterwave in {userCurrency}.
            </p>
            <form onSubmit={handleDepositSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  Amount ({currencySymbol} {userCurrency})
                </label>
                <input type="number" required min="1" value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="input-field" style={{ width: '100%', fontSize: '1.1rem', fontWeight: 800 }} />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {getPresetAmounts(userCurrency).map((amt) => (
                  <button key={amt} type="button" onClick={() => setDepositAmount(amt)}
                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: depositAmount === amt ? '1px solid var(--primary)' : '1px solid var(--border-color)', background: depositAmount === amt ? 'rgba(253,103,48,0.1)' : 'var(--bg-tertiary)', color: depositAmount === amt ? 'var(--primary)' : 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                    +{currencySymbol}{amt.toLocaleString()}
                  </button>
                ))}
              </div>
              <button type="submit" disabled={processingDeposit} className="btn-primary"
                style={{ width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {processingDeposit ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
                Proceed to Deposit ({currencySymbol})
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setShowWithdrawModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'var(--card-bg)', borderRadius: '18px', padding: '24px 20px', maxWidth: '420px', width: '100%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-color)', boxShadow: '0 16px 40px rgba(0,0,0,0.18)', position: 'relative' }}
          >
            <button onClick={() => setShowWithdrawModal(false)} style={{ position: 'absolute', top: '18px', right: '18px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
              <X size={16} />
            </button>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
              Withdraw ({userCurrency})
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Funds will be sent to your saved payout account.
            </p>

            {/* Saved Payout Destination */}
            <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Destination</span>
                <button type="button"
                  onClick={() => { setShowWithdrawModal(false); setShowPayoutSettingsModal(true); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.74rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px', padding: 0 }}>
                  <Edit3 size={11} /> Edit
                </button>
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{savedBankDetails?.bankName}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {savedBankDetails?.accountNumber} • {savedBankDetails?.accountName}
              </div>
            </div>

            <form onSubmit={handleWithdrawalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                  Amount ({currencySymbol})
                </label>
                <input type="number" required min="1" max={currentBalance > 0 ? currentBalance : undefined} value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="input-field" style={{ width: '100%', fontSize: '1rem', fontWeight: 800, height: '40px', padding: '0 12px', borderRadius: '10px' }} />
                {currentBalance <= 0 && (
                  <span style={{ fontSize: '0.74rem', color: 'var(--primary)', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                    Available balance is {currencySymbol}0.
                  </span>
                )}
              </div>
              <button type="submit" disabled={processingWithdraw} className="btn-primary"
                style={{ width: '100%', height: '42px', borderRadius: '10px', fontSize: '0.84rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                {processingWithdraw ? <Loader2 size={16} className="animate-spin" /> : <ArrowUpRight size={16} />}
                Confirm Withdrawal ({currencySymbol}{withdrawAmount.toLocaleString()})
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* ── Edit Payout Settings Modal ─────────────────────────────────────────── */}
      {showPayoutSettingsModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={() => setShowPayoutSettingsModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'var(--card-bg)', borderRadius: '24px', padding: '24px 20px', maxWidth: '480px', width: '100%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-color)', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', position: 'relative' }}
          >
            <button onClick={() => setShowPayoutSettingsModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>Update Payout Method</h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Change your default bank or mobile money payout account.
            </p>
            <form onSubmit={handleSavePayoutSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>Country</label>
                <select value={settingsCountry} onChange={(e) => { setSettingsCountry(e.target.value); setSettingsBankCode(''); setSettingsBankName(''); }}
                  className="input-field" style={{ width: '100%', fontWeight: 700 }}>
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code}>{c.name} ({c.currency})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>Bank / Provider</label>
                {settingsLoadingBanks ? (
                  <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Loader2 size={16} className="animate-spin" /> Loading banks…
                  </div>
                ) : settingsBanksList.length > 0 ? (
                  <select value={settingsBankCode} onChange={(e) => {
                    setSettingsBankCode(e.target.value);
                    const b = settingsBanksList.find((x) => String(x.code || x.id) === e.target.value);
                    if (b) setSettingsBankName(b.name);
                  }} className="input-field" style={{ width: '100%', fontWeight: 700 }}>
                    {settingsBanksList.map((b) => (
                      <option key={b.code || b.id} value={b.code || b.id}>{b.name}</option>
                    ))}
                  </select>
                ) : (
                  <input type="text" required placeholder="Bank or Provider Name" value={settingsBankName}
                    onChange={(e) => { setSettingsBankName(e.target.value); setSettingsBankCode('044'); }}
                    className="input-field" style={{ width: '100%', fontWeight: 700 }} />
                )}
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>Account Number</label>
                <input type="text" required value={settingsAccountNumber}
                  onChange={(e) => setSettingsAccountNumber(e.target.value)}
                  className="input-field" style={{ width: '100%', fontWeight: 700, letterSpacing: '0.05em' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>Account Holder Name</label>
                <input type="text" required value={settingsAccountName}
                  onChange={(e) => setSettingsAccountName(e.target.value)}
                  className="input-field" style={{ width: '100%', fontWeight: 700 }} />
              </div>
              <button type="submit" disabled={savingSettings} className="btn-primary"
                style={{ width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {savingSettings ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                Save Payout Method
              </button>
            </form>
          </motion.div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
};
