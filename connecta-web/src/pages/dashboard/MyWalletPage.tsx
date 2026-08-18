import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { motion } from 'framer-motion';
import {
  ShieldCheck, ArrowDownLeft, ArrowUpRight, RefreshCw, Loader2,
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
  const [accountName, setAccountName] = useState(userName);
  const [saving, setSaving] = useState(false);

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
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ width: '100%', maxWidth: '520px' }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '20px',
              background: 'var(--grad-primary)', margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 12px 30px rgba(253,103,48,0.25)',
            }}>
              <Building2 size={34} color="#fff" />
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
              Set Up Your Payout Method
            </h1>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 }}>
              Before accessing your wallet, you need to add a default bank or mobile money account where your earnings will be sent. Your account currency is{' '}
              <strong style={{ color: 'var(--primary)' }}>{currencyConfig.flag} {userCurrency} ({currencySymbol})</strong>.
            </p>
          </div>

          {/* Setup Card */}
          <div className="glass-card" style={{ borderRadius: '24px', padding: '32px', border: '1px solid var(--border-color)' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

              {/* Country */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  Your Country
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', fontWeight: 700 }}
                >
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} — {c.currency}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bank / Provider */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  Bank or Mobile Money Provider
                </label>
                {loadingBanks ? (
                  <div style={{
                    padding: '14px 16px', borderRadius: '12px',
                    background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                    color: 'var(--text-muted)', fontSize: '0.85rem',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}>
                    <Loader2 size={16} className="animate-spin" /> Loading available banks…
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
                    style={{ width: '100%', fontWeight: 700 }}
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
                    style={{ width: '100%', fontWeight: 700 }}
                  />
                )}
              </div>

              {/* Account Number */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  Account / Mobile Money Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0812345678"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', fontWeight: 700, letterSpacing: '0.06em' }}
                />
              </div>

              {/* Account Name */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  Account Holder Name
                </label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', fontWeight: 700 }}
                />
              </div>

              {/* Info notice */}
              <div style={{
                padding: '12px 16px', borderRadius: '12px',
                background: 'rgba(253,103,48,0.06)', border: '1px solid rgba(253,103,48,0.2)',
                fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6,
              }}>
                🔒 Your payout details are stored securely. You can update them anytime from your wallet settings.
                This account will be used for all future earnings withdrawals in <strong>{userCurrency}</strong>.
              </div>

              <motion.button
                type="submit"
                disabled={saving}
                whileHover={{ scale: saving ? 1 : 1.02 }}
                whileTap={{ scale: saving ? 1 : 0.98 }}
                className="btn-primary"
                style={{
                  width: '100%', padding: '16px', borderRadius: '14px',
                  fontWeight: 800, fontSize: '1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                }}
              >
                {saving ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
                {saving ? 'Saving Payout Method…' : 'Save & Access My Wallet'}
              </motion.button>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            You must complete this step to send and receive payments on Connecta.
          </p>
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
      const [wRes, txRes, vtRes] = await Promise.all([
        walletAPI.getWallet().catch(() => null),
        walletAPI.getTransactions().catch(() => null),
        walletAPI.getVirtualAccount().catch(() => null),
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

      if (vtRes?.success && vtRes.data) setVirtualAccount(vtRes.data);

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
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          {isFreelancer ? 'Freelancer Earnings & Wallet' : 'Client Escrow & Funding Wallet'}
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
          {isFreelancer
            ? `Track project earnings and withdraw in ${userCurrency} (${currencySymbol}).`
            : `Fund your wallet in ${userCurrency}, manage escrow deposits, and review transactions.`}
        </p>
      </div>



      {/* Wallet Hero Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>

        {/* Balance Card */}
        <motion.div
          whileHover={{ y: -2 }}
          style={{ background: 'var(--grad-primary)', padding: '24px', borderRadius: '20px', color: '#fff', boxShadow: '0 12px 30px rgba(253,103,48,0.2)' }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.9, textTransform: 'uppercase', marginBottom: '8px' }}>
            {isFreelancer ? `Available Balance (${userCurrency})` : `Client Wallet (${userCurrency})`}
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '16px' }}>
            {formatDualPrice(currentBalance)}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {isFreelancer ? (
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setShowWithdrawModal(true)}
                style={{ background: '#fff', color: 'var(--primary)', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(0,0,0,0.12)' }}
              >
                <ArrowUpRight size={16} /> Withdraw ({currencySymbol})
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setShowDepositModal(true)}
                style={{ background: '#fff', color: 'var(--primary)', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(0,0,0,0.12)' }}
              >
                <PlusCircle size={16} /> Fund Wallet ({currencySymbol})
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Escrow Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="glass-card"
          style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--border-color)' }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px' }}>
            {isFreelancer ? 'Pending Escrow Earnings' : 'Active Escrow Milestones'}
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            {formatDualPrice(currentEscrow)}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} /> 100% Connecta Escrow Protected
          </span>
        </motion.div>

        {/* Payout Method Card (Freelancers only) */}
        {isFreelancer && savedBankDetails?.accountNumber && (
          <motion.div
            whileHover={{ y: -2 }}
            className="glass-card"
            style={{ padding: '24px', borderRadius: '20px', border: '1px solid rgba(16,185,129,0.3)', position: 'relative', overflow: 'hidden' }}
          >
            {/* subtle green glow strip */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #10b981, #34d399)' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                Default Payout Method
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16,185,129,0.12)', color: 'var(--success)', padding: '3px 9px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>
                <CheckCircle2 size={11} /> Verified
              </div>
            </div>

            {/* Bank name large */}
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              {savedBankDetails.bankName}
            </div>

            {/* Account number */}
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.1em', marginBottom: '4px' }}>
              {savedBankDetails.accountNumber}
            </div>

            {/* Account name */}
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              {savedBankDetails.accountName}
            </div>

            <button
              onClick={() => setShowPayoutSettingsModal(true)}
              style={{
                background: 'var(--bg-tertiary)', color: 'var(--text-primary)',
                border: '1px solid var(--border-color)', padding: '8px 14px',
                borderRadius: '10px', fontWeight: 700, fontSize: '0.8rem',
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
              }}
            >
              <Edit3 size={13} /> Edit Payout Method
            </button>
          </motion.div>
        )}

        {/* Virtual Account Card (clients only) */}
        {!isFreelancer && (
          <motion.div
            whileHover={{ y: -2 }}
            className="glass-card"
            style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--border-color)' }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px' }}>
              Virtual Bank Transfer
            </div>
            {virtualAccount ? (
              <>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary)', marginBottom: '4px' }}>
                  {virtualAccount.bankName || 'Wema Bank'} &bull; {virtualAccount.accountNumber}
                </div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
                  Beneficiary: {virtualAccount.accountName || 'Connecta Escrow'}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${virtualAccount.bankName} - ${virtualAccount.accountNumber}`);
                    showToast('Account details copied!', 'info');
                  }}
                  style={{ background: 'var(--bg-tertiary)', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Copy size={12} /> Copy Details
                </button>
              </>
            ) : (
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Generate a dedicated virtual bank account to fund via wire transfer.
                </p>
                <button
                  onClick={handleGenerateVirtualAccount}
                  disabled={generatingVirtualAcc}
                  className="btn-primary"
                  style={{ padding: '8px 14px', fontSize: '0.8rem', borderRadius: '8px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  {generatingVirtualAcc ? <Loader2 size={14} className="animate-spin" /> : <Building2 size={14} />}
                  Generate Virtual Account
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Transaction History */}
      <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {isFreelancer ? 'Payout & Earnings History' : 'Deposit & Funding History'}
          </h3>
          <button
            onClick={fetchWalletData}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600 }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {transactions.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            No transaction records found yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {transactions.map((tx) => (
              <div
                key={tx._id || tx.id || Math.random()}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderRadius: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: tx.type === 'deposit' ? 'rgba(16,185,129,0.1)' : 'rgba(253,103,48,0.1)', color: tx.type === 'deposit' ? 'var(--success)' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {tx.type === 'deposit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{tx.description || tx.type || 'Wallet Activity'}</div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'Recent'}</span>
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
            style={{ background: 'var(--card-bg)', borderRadius: '24px', padding: '32px', maxWidth: '460px', width: '100%', border: '1px solid var(--border-color)', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', position: 'relative' }}
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

      {/* ── Withdrawal Modal ───────────────────────────────────────────────────── */}
      {showWithdrawModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={() => setShowWithdrawModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'var(--card-bg)', borderRadius: '24px', padding: '32px', maxWidth: '460px', width: '100%', border: '1px solid var(--border-color)', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', position: 'relative' }}
          >
            <button onClick={() => setShowWithdrawModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
              Withdraw Earnings ({currencySymbol} {userCurrency})
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Funds will be sent to your saved payout account.
            </p>

            {/* Saved Payout Destination */}
            <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>Payout Destination</span>
                <button type="button"
                  onClick={() => { setShowWithdrawModal(false); setShowPayoutSettingsModal(true); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.76rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Edit3 size={12} /> Edit
                </button>
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>🏦 {savedBankDetails?.bankName}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {savedBankDetails?.accountNumber} &mdash; {savedBankDetails?.accountName}
              </div>
            </div>

            <form onSubmit={handleWithdrawalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  Withdrawal Amount ({currencySymbol} {userCurrency})
                </label>
                <input type="number" required min="1" max={currentBalance > 0 ? currentBalance : undefined} value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="input-field" style={{ width: '100%', fontSize: '1.1rem', fontWeight: 800 }} />
                {currentBalance <= 0 && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                    ⚠️ Your available balance is currently {currencySymbol}0. You cannot withdraw until you have funds in your wallet.
                  </span>
                )}
              </div>
              <button type="submit" disabled={processingWithdraw} className="btn-primary"
                style={{ width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {processingWithdraw ? <Loader2 size={18} className="animate-spin" /> : <ArrowUpRight size={18} />}
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
            style={{ background: 'var(--card-bg)', borderRadius: '24px', padding: '32px', maxWidth: '480px', width: '100%', border: '1px solid var(--border-color)', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', position: 'relative' }}
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
    </DashboardLayout>
  );
};
