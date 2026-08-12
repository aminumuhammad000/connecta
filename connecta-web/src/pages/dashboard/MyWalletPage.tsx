import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowDownLeft, ArrowUpRight, RefreshCw, Loader2, X, PlusCircle, Copy, Building2, CreditCard } from 'lucide-react';
import { walletAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

export const MyWalletPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { formatDualPrice } = useCurrency();
  const isFreelancer = user?.userType === 'freelancer';

  const [wallet, setWallet] = useState<any | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingVirtualAcc, setGeneratingVirtualAcc] = useState(false);

  // Client Deposit Modal State
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(5000);
  const [processingDeposit, setProcessingDeposit] = useState(false);

  // Freelancer Withdrawal Modal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(5000);
  const [bankName, setBankName] = useState('GTBank');
  const [accountNumber, setAccountNumber] = useState('0123456789');
  const accountName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Valued User';
  const [processingWithdraw, setProcessingWithdraw] = useState(false);

  const [virtualAccount, setVirtualAccount] = useState<any | null>(null);

  useEffect(() => {
    fetchWalletData();
  }, []);

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
      } else {
        setWallet({ balance: 0, escrowBalance: 0, availableBalance: 0 });
      }

      if (vtRes?.success && vtRes?.data) {
        setVirtualAccount(vtRes.data);
      }

      if (txRes?.success && Array.isArray(txRes.data)) {
        setTransactions(txRes.data);
      } else if (Array.isArray(txRes)) {
        setTransactions(txRes);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error('Error fetching wallet:', err);
      setWallet({ balance: 0, escrowBalance: 0, availableBalance: 0 });
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVirtualAccount = async () => {
    setGeneratingVirtualAcc(true);
    try {
      const res = await walletAPI.getVirtualAccount();
      if (res?.success && res.data) {
        setVirtualAccount(res.data);
        showToast('Virtual Bank Deposit Account generated successfully!', 'success');
      } else {
        showToast(res?.message || 'Could not generate virtual account.', 'error');
      }
    } catch (err: any) {
      console.error('Generate Virtual Account Error:', err);
      showToast(err.response?.data?.message || 'Virtual account generation pending system activation.', 'info');
    } finally {
      setGeneratingVirtualAcc(false);
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount <= 0) {
      showToast('Please enter a valid deposit amount.', 'error');
      return;
    }
    setProcessingDeposit(true);

    try {
      const res = await walletAPI.initializeTopup(depositAmount);
      if (res?.data?.authorization_url) {
        window.location.href = res.data.authorization_url;
      } else {
        showToast('Paystack payment link initialized successfully!', 'success');
        fetchWalletData();
        setShowDepositModal(false);
      }
    } catch (err: any) {
      console.error('Failed to initialize deposit:', err);
      showToast(err.response?.data?.message || 'Failed to initialize Paystack deposit.', 'error');
    } finally {
      setProcessingDeposit(false);
    }
  };

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount <= 0) {
      showToast('Please enter a valid withdrawal amount.', 'error');
      return;
    }
    setProcessingWithdraw(true);

    try {
      await walletAPI.requestWithdrawal({
        amount: withdrawAmount,
        bankDetails: {
          bankName,
          accountNumber,
          accountName,
        },
      });
      setShowWithdrawModal(false);
      showToast(`Withdrawal request of ₦${withdrawAmount.toLocaleString()} submitted successfully!`, 'success');
      fetchWalletData();
    } catch (err: any) {
      console.error('Failed to process withdrawal:', err);
      showToast(err.response?.data?.message || 'Failed to submit withdrawal request.', 'error');
    } finally {
      setProcessingWithdraw(false);
    }
  };

  // Real backend balances (0 when user has no funds)
  const currentBalance = Number(wallet?.balance ?? wallet?.availableBalance ?? 0);
  const currentEscrow = Number(wallet?.escrowBalance ?? 0);

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          {isFreelancer ? 'Freelancer Earnings & Wallet' : 'Client Escrow & Funding Wallet'}
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
          {isFreelancer
            ? 'Track your project earnings, active milestone funds, and bank payouts.'
            : 'Fund your client wallet, manage active project escrow deposits, and review transactions.'}
        </p>
      </div>

      {/* Role-Specific Wallet Hero Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        {/* Card 1: Available Balance */}
        <motion.div
          whileHover={{ y: -2 }}
          style={{
            background: 'var(--grad-primary)',
            padding: '24px',
            borderRadius: '20px',
            color: '#fff',
            boxShadow: '0 12px 30px rgba(253,103,48,0.2)',
          }}
        >
          <div style={{ fontSize: '0.82rem', fontWeight: 600, opacity: 0.9, textTransform: 'uppercase', marginBottom: '8px' }}>
            {isFreelancer ? 'Available Balance' : 'Client Wallet Balance'}
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '16px' }}>
            {formatDualPrice(currentBalance)}
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            {isFreelancer ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowWithdrawModal(true)}
                style={{
                  background: '#ffffff',
                  color: 'var(--primary)',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                }}
              >
                <ArrowUpRight size={16} /> Withdraw Funds
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowDepositModal(true)}
                style={{
                  background: '#ffffff',
                  color: 'var(--primary)',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                }}
              >
                <PlusCircle size={16} /> Fund Escrow Wallet
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Card 2: Active Escrow Milestone Card */}
        <motion.div
          whileHover={{ y: -2 }}
          className="glass-card"
          style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--border-color)' }}
        >
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px' }}>
            {isFreelancer ? 'Pending Escrow Earnings' : 'Active Escrow Milestones'}
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            {formatDualPrice(currentEscrow)}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} /> 100% Paystack Escrow Protected
          </span>
        </motion.div>

        {/* Card 3: Virtual Account Transfer Info for Clients */}
        {!isFreelancer && (
          <motion.div
            whileHover={{ y: -2 }}
            className="glass-card"
            style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--border-color)' }}
          >
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px' }}>
              Virtual Bank Transfer Details
            </div>
            {virtualAccount ? (
              <>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '4px' }}>
                  {virtualAccount.bankName || 'Wema Bank'} • {virtualAccount.accountNumber}
                </div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
                  Beneficiary: {virtualAccount.accountName || 'Connecta Escrow'}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${virtualAccount.bankName} - ${virtualAccount.accountNumber}`);
                    showToast('Virtual account details copied to clipboard!', 'info');
                  }}
                  style={{ background: 'var(--bg-tertiary)', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Copy size={12} /> Copy Account Details
                </button>
              </>
            ) : (
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Generate a dedicated virtual bank account to top up via instant wire transfer.
                </div>
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

      {/* Real Transaction History List */}
      <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {isFreelancer ? 'Payout & Earnings History' : 'Escrow Deposit & Funding History'}
          </h3>
          <button
            onClick={fetchWalletData}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600 }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
            <span>Loading transaction logs...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            No transaction records found in your wallet history yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {transactions.map((tx) => (
              <div
                key={tx._id || tx.id || Math.random()}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 18px',
                  borderRadius: '14px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: tx.type === 'deposit' ? 'rgba(16,185,129,0.1)' : 'rgba(253,103,48,0.1)',
                    color: tx.type === 'deposit' ? 'var(--success)' : 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
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

      {/* Client Deposit Modal */}
      {showDepositModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 9999,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }} onClick={() => setShowDepositModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--card-bg)',
              borderRadius: '24px',
              padding: '32px',
              maxWidth: '460px',
              width: '100%',
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setShowDepositModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
              Fund Client Wallet
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Deposit funds into your secure Paystack Escrow wallet to fund milestones.
            </p>

            <form onSubmit={handleDepositSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  Deposit Amount (USD / NGN Equivalent)
                </label>
                <input
                  type="number"
                  required
                  min="500"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="input-field"
                  style={{ width: '100%', fontSize: '1.1rem', fontWeight: 800 }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {[5000, 20000, 50000, 100000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      border: depositAmount === amt ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      background: depositAmount === amt ? 'rgba(253,103,48,0.1)' : 'var(--bg-tertiary)',
                      color: depositAmount === amt ? 'var(--primary)' : 'var(--text-secondary)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    +₦{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={processingDeposit}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 700, marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {processingDeposit ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
                Proceed to Paystack Deposit
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Freelancer Withdrawal Modal */}
      {showWithdrawModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 9999,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }} onClick={() => setShowWithdrawModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--card-bg)',
              borderRadius: '24px',
              padding: '32px',
              maxWidth: '460px',
              width: '100%',
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setShowWithdrawModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
              Request Bank Payout
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Withdraw earnings to your registered local bank account.
            </p>

            <form onSubmit={handleWithdrawalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  Withdrawal Amount (₦)
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  max={currentBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="input-field"
                  style={{ width: '100%', fontSize: '1.1rem', fontWeight: 800 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  Bank Name
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', fontWeight: 700 }}
                >
                  <option value="GTBank">Guaranty Trust Bank (GTBank)</option>
                  <option value="Access Bank">Access Bank</option>
                  <option value="Zenith Bank">Zenith Bank</option>
                  <option value="First Bank">First Bank of Nigeria</option>
                  <option value="UBA">United Bank for Africa (UBA)</option>
                  <option value="Kuda Bank">Kuda Microfinance Bank</option>
                  <option value="OPay">OPay Digital Services</option>
                  <option value="Palmpay">PalmPay</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  10-Digit Account Number
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', letterSpacing: '0.05em', fontWeight: 700 }}
                />
              </div>

              <button
                type="submit"
                disabled={processingWithdraw}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 700, marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {processingWithdraw ? <Loader2 size={18} className="animate-spin" /> : <ArrowUpRight size={18} />}
                Confirm Bank Payout Request
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};
