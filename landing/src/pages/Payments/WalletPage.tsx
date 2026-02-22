import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useNotification } from '../../contexts/NotificationContext';
import styles from './styles/WalletPage.module.css';

interface Wallet {
  balance: number;
  escrowBalance: number;
  availableBalance: number;
  totalEarnings: number;
  totalSpent: number;
  currency: string;
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

const WalletPage = () => {
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
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (data.success) {
        setWallet(data.data);
      }
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
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (data.success) {
        setTransactions(data.data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchBanks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/payments/banks', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (data.success) {
        setBanks(data.data);
      }
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
      case 'payment_received':
        return 'mdi:arrow-down-circle';
      case 'payment_sent':
        return 'mdi:arrow-up-circle';
      case 'withdrawal':
        return 'mdi:bank-transfer-out';
      case 'refund':
        return 'mdi:cash-refund';
      default:
        return 'mdi:cash';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'payment_received':
        return styles.positive;
      case 'payment_sent':
      case 'withdrawal':
        return styles.negative;
      case 'refund':
        return styles.neutral;
      default:
        return '';
    }
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
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>My Wallet</h1>
      </div>

      {/* Wallet Balance Cards */}
      <div className={styles.balanceCards}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <Icon icon="mdi:wallet" width="32" />
          </div>
          <div className={styles.cardContent}>
            <p className={styles.cardLabel}>Total Balance</p>
            <h2 className={styles.cardAmount}>
              {wallet?.currency}{wallet?.balance.toLocaleString() || '0'}
            </h2>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <Icon icon="mdi:shield-lock" width="32" />
          </div>
          <div className={styles.cardContent}>
            <p className={styles.cardLabel}>In Escrow</p>
            <h2 className={styles.cardAmount}>
              {wallet?.currency}{wallet?.escrowBalance.toLocaleString() || '0'}
            </h2>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <Icon icon="mdi:cash-check" width="32" />
          </div>
          <div className={styles.cardContent}>
            <p className={styles.cardLabel}>Available</p>
            <h2 className={styles.cardAmount}>
              {wallet?.currency}{wallet?.availableBalance.toLocaleString() || '0'}
            </h2>
            <button 
              className={styles.withdrawBtn}
              onClick={() => setShowWithdrawModal(true)}
              disabled={(wallet?.availableBalance || 0) <= 0}
            >
              <Icon icon="mdi:bank-transfer" width="18" />
              Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className={styles.transactions}>
        <h3>Recent Transactions</h3>
        {transactions.length === 0 ? (
          <div className={styles.empty}>
            <Icon icon="mdi:receipt-text-outline" width="48" />
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className={styles.transactionList}>
            {transactions.map((transaction) => (
              <div key={transaction._id} className={styles.transactionItem}>
                <div className={styles.transactionIcon}>
                  <Icon 
                    icon={getTransactionIcon(transaction.type)} 
                    width="24" 
                    className={getTransactionColor(transaction.type)}
                  />
                </div>
                <div className={styles.transactionDetails}>
                  <p className={styles.transactionDesc}>{transaction.description}</p>
                  <p className={styles.transactionDate}>
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className={`${styles.transactionAmount} ${getTransactionColor(transaction.type)}`}>
                  {transaction.amount > 0 ? '+' : ''}
                  {transaction.currency}{Math.abs(transaction.amount).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Withdraw Funds</h3>
              <button onClick={() => setShowWithdrawModal(false)}>
                <Icon icon="mdi:close" width="24" />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Amount</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  max={wallet?.availableBalance}
                />
                <p className={styles.hint}>
                  Available: {wallet?.currency}{wallet?.availableBalance.toLocaleString()}
                </p>
              </div>

              <div className={styles.formGroup}>
                <label>Bank</label>
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
                  <option value="">Select Bank</option>
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
                />
              </div>

              <div className={styles.formGroup}>
                <label>Account Name</label>
                <input
                  type="text"
                  value={bankDetails.accountName}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                  placeholder="Account holder name"
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button onClick={() => setShowWithdrawModal(false)} className={styles.cancelBtn}>
                Cancel
              </button>
              <button onClick={handleWithdraw} className={styles.submitBtn}>
                Request Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;
