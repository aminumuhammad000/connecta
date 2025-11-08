import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useNotification } from '../../contexts/NotificationContext';
import Header from '../../components/Header';
import DashboardNav from '../Dashboard/components/DashboardNav';
import styles from './styles/FreelancerWallet.module.css';

interface Wallet {
  balance: number;
  escrowBalance: number;
  availableBalance: number;
  totalEarnings: number;
  currency: string;
  pendingPayments?: number;
  ongoingProjects?: number;
  projects?: Array<{
    _id: string;
    title: string;
    budget: { amount: number; currency: string };
    status: string;
    clientName: string;
  }>;
}

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  createdAt: string;
}

interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
}

const FreelancerWallet = () => {
  const { showLoader, hideLoader, showError, showSuccess } = useNotification();
  
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [banks, setBanks] = useState<any[]>([]);
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountName: '',
    accountNumber: '',
    bankName: '',
    bankCode: '',
  });

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
    fetchBanks();
  }, []);

  const fetchWallet = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/payments/wallet/balance', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) setWallet(data.data);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/payments/transactions?limit=10', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) setTransactions(data.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchBanks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/payments/banks', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) setBanks(data.data);
    } catch (error) {
      console.error('Error fetching banks:', error);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      showError('Please enter a valid amount');
      return;
    }

    if (!bankDetails.accountNumber || !bankDetails.bankCode) {
      showError('Please provide bank details');
      return;
    }

    try {
      showLoader();
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/payments/withdrawal/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount),
          bankDetails,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Withdrawal request submitted successfully');
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        fetchWallet();
        fetchTransactions();
      } else {
        showError(data.message || 'Failed to request withdrawal');
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      showError('Failed to process withdrawal request');
    } finally {
      hideLoader();
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'payment_received': return 'mdi:arrow-down-circle';
      case 'withdrawal': return 'mdi:bank-transfer-out';
      case 'refund': return 'mdi:cash-refund';
      default: return 'mdi:cash';
    }
  };

  const getTransactionColor = (type: string) => {
    if (type === 'payment_received') return styles.positive;
    if (type === 'withdrawal') return styles.negative;
    return styles.neutral;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <Icon icon="mdi:loading" className={styles.spinner} width="48" />
          <p>Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <Header />
      <DashboardNav />
      
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>My wallet</h1>

      {/* Balance Overview Cards */}
      <div className={styles.balanceSection}>
        <div className={styles.balanceCard}>
          <div className={styles.balanceInfo}>
            <p className={styles.balanceLabel}>Total Earnings</p>
            <h2 className={styles.balanceAmount}>
              {wallet?.currency}{wallet?.totalEarnings.toLocaleString() || '0'}
            </h2>
            <span className={styles.balanceHint}>
              {wallet?.ongoingProjects || 0} ongoing project{wallet?.ongoingProjects !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className={styles.balanceCard}>
          <div className={styles.balanceInfo}>
            <p className={styles.balanceLabel}>Pending Payments</p>
            <h2 className={styles.balanceAmount}>
              {wallet?.currency}{wallet?.pendingPayments?.toLocaleString() || '0'}
            </h2>
            <span className={styles.balanceHint}>Awaiting client payment</span>
          </div>
        </div>

        <div className={styles.balanceCard}>
          <div className={styles.balanceInfo}>
            <p className={styles.balanceLabel}>In Escrow</p>
            <h2 className={styles.balanceAmount}>
              {wallet?.currency}{wallet?.escrowBalance.toLocaleString() || '0'}
            </h2>
            <span className={styles.balanceHint}>Pending approval</span>
          </div>
        </div>

        <div className={styles.balanceCard}>
          <div className={styles.balanceInfo}>
            <p className={styles.balanceLabel}>Available Balance</p>
            <h2 className={styles.balanceAmount}>
              {wallet?.currency}{wallet?.availableBalance.toLocaleString() || '0'}
            </h2>
          </div>
          <button 
            className={styles.withdrawButton}
            onClick={() => setShowWithdrawModal(true)}
            disabled={(wallet?.availableBalance || 0) <= 0}
          >
            Withdraw
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className={styles.transactionsSection}>
        <h2 className={styles.sectionTitle}>Recent Transactions</h2>
        
        {transactions.length === 0 ? (
          <div className={styles.emptyState}>
            <Icon icon="mdi:receipt-text-outline" width="64" />
            <p>No transactions yet</p>
            <small>Your payment history will appear here</small>
          </div>
        ) : (
          <div className={styles.transactionsList}>
            {transactions.map((transaction) => (
              <div key={transaction._id} className={styles.transactionCard}>
                <div className={styles.transactionContent}>
                  <div className={styles.transactionHeader}>
                    <h3 className={styles.transactionTitle}>{transaction.description}</h3>
                    {transaction.amount > 0 ? (
                      <span className={styles.badgeSuccess}>Received</span>
                    ) : (
                      <span className={styles.badgeWarning}>Withdrawn</span>
                    )}
                  </div>
                  
                  <p className={styles.transactionDate}>
                    <Icon icon="mdi:calendar" width="16" />
                    {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                  
                  <div className={styles.transactionFooter}>
                    <span className={styles.transactionType}>{transaction.type.replace('_', ' ')}</span>
                    <span className={`${styles.transactionAmount} ${transaction.amount > 0 ? styles.positive : styles.negative}`}>
                      {transaction.amount > 0 ? '+' : ''}
                      {transaction.currency}{Math.abs(transaction.amount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className={styles.modal} onClick={() => setShowWithdrawModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>💸 Withdraw Funds</h3>
              <button onClick={() => setShowWithdrawModal(false)}>
                <Icon icon="mdi:close" width="24" />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Amount to Withdraw</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  max={wallet?.availableBalance}
                />
                <p className={styles.hint}>
                  Available: {wallet?.currency}{wallet?.availableBalance.toLocaleString()}
                </p>
              </div>

              <div className={styles.formGroup}>
                <label>Select Bank</label>
                <select
                  value={bankDetails.bankCode}
                  onChange={(e) => {
                    const bank = banks.find(b => b.code === e.target.value);
                    setBankDetails({
                      ...bankDetails,
                      bankCode: e.target.value,
                      bankName: bank?.name || '',
                    });
                  }}
                >
                  <option value="">Choose your bank</option>
                  {banks.map((bank) => (
                    <option key={bank.code} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Account Number</label>
                <input
                  type="text"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                  placeholder="0123456789"
                  maxLength={10}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Account Name</label>
                <input
                  type="text"
                  value={bankDetails.accountName}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                  placeholder="Your account name"
                />
              </div>

              <div className={styles.infoBox}>
                <Icon icon="mdi:information" width="20" />
                <div>
                  <strong>Processing Time:</strong> 1-3 business days<br/>
                  <strong>Fee:</strong> 1% or ₦100 (whichever is higher)
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button onClick={() => setShowWithdrawModal(false)} className={styles.cancelBtn}>
                Cancel
              </button>
              <button onClick={handleWithdraw} className={styles.submitBtn}>
                <Icon icon="mdi:send" width="18" />
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default FreelancerWallet;
