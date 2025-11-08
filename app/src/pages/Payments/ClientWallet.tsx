import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useNotification } from '../../contexts/NotificationContext';
import ClientSidebar from '../client/components/ClientSidebar';
import ClientHeader from '../client/components/ClientHeader';
import styles from './styles/ClientWallet.module.css';

interface Wallet {
  totalSpent: number;
  currency: string;
}

interface Payment {
  _id: string;
  projectId: {
    _id: string;
    title: string;
  };
  payeeId: {
    firstName: string;
    lastName: string;
  };
  amount: number;
  platformFee: number;
  netAmount: number;
  status: string;
  escrowStatus: string;
  currency: string;
  paidAt: string;
  createdAt: string;
}

const ClientWallet = () => {
  const { showError } = useNotification();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'refunded'>('all');

  useEffect(() => {
    fetchWallet();
    fetchPayments();
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

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/payments/history?limit=20', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) setPayments(data.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const handleReleasePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to release this payment? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/payments/${paymentId}/release`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Payment released successfully');
        fetchPayments();
      } else {
        showError(data.message || 'Failed to release payment');
      }
    } catch (error) {
      showError('Failed to release payment');
    }
  };

  const getStatusBadge = (status: string, escrowStatus: string) => {
    if (status === 'completed' && escrowStatus === 'held') {
      return <span className={`${styles.badge} ${styles.warning}`}>In Escrow</span>;
    }
    if (status === 'completed' && escrowStatus === 'released') {
      return <span className={`${styles.badge} ${styles.success}`}>Released</span>;
    }
    if (status === 'refunded') {
      return <span className={`${styles.badge} ${styles.neutral}`}>Refunded</span>;
    }
    if (status === 'pending') {
      return <span className={`${styles.badge} ${styles.info}`}>Pending</span>;
    }
    return <span className={`${styles.badge}`}>{status}</span>;
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    if (filter === 'completed') return payment.status === 'completed';
    if (filter === 'pending') return payment.status === 'pending';
    if (filter === 'refunded') return payment.status === 'refunded';
    return true;
  });

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Icon icon="mdi:loading" className={styles.spinner} width="48" />
        <p>Loading payments...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ClientSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={styles.mainContent}>
        <ClientHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <div className={styles.content}>
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>💳 Payment History</h1>
              <p className={styles.pageSubtitle}>Track all your payments and transactions</p>
            </div>
          </div>

      {/* Stats Cards - Client View */}
      <div className={styles.balanceCards}>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            <Icon icon="mdi:credit-card" width="32" />
          </div>
          <div className={styles.cardContent}>
            <p className={styles.cardLabel}>Total Spent</p>
            <h2 className={styles.cardAmount}>
              {wallet?.currency}{wallet?.totalSpent.toLocaleString() || '0'}
            </h2>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon} style={{background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)'}}>
            <Icon icon="mdi:check-circle" width="32" />
          </div>
          <div className={styles.cardContent}>
            <p className={styles.cardLabel}>Completed Payments</p>
            <h2 className={styles.cardAmount}>
              {payments.filter(p => p.status === 'completed').length}
            </h2>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon} style={{background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)'}}>
            <Icon icon="mdi:shield-lock" width="32" />
          </div>
          <div className={styles.cardContent}>
            <p className={styles.cardLabel}>In Escrow</p>
            <h2 className={styles.cardAmount}>
              {payments.filter(p => p.escrowStatus === 'held').length}
            </h2>
            <small className={styles.cardHint}>Awaiting release</small>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className={styles.paymentsSection}>
        <div className={styles.transactionHeader}>
          <h3>All Payments</h3>
          <div className={styles.filters}>
            <button 
              className={filter === 'all' ? styles.activeFilter : ''}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={filter === 'completed' ? styles.activeFilter : ''}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
            <button 
              className={filter === 'pending' ? styles.activeFilter : ''}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button 
              className={filter === 'refunded' ? styles.activeFilter : ''}
              onClick={() => setFilter('refunded')}
            >
              Refunded
            </button>
          </div>
        </div>

        {filteredPayments.length === 0 ? (
          <div className={styles.empty}>
            <Icon icon="mdi:receipt-text-outline" width="48" />
            <p>No payments found</p>
            <small>Payments you make to freelancers will appear here</small>
          </div>
        ) : (
          <div className={styles.paymentList}>
            {filteredPayments.map((payment) => (
              <div key={payment._id} className={styles.paymentCard}>
                <div className={styles.paymentHeader}>
                  <div>
                    <h4>{payment.projectId?.title || 'Project Payment'}</h4>
                    <p className={styles.freelancerName}>
                      To: {payment.payeeId?.firstName} {payment.payeeId?.lastName}
                    </p>
                  </div>
                  {getStatusBadge(payment.status, payment.escrowStatus)}
                </div>

                <div className={styles.paymentDetails}>
                  <div className={styles.paymentRow}>
                    <span>Amount Paid:</span>
                    <strong>{payment.currency}{payment.amount.toLocaleString()}</strong>
                  </div>
                  <div className={styles.paymentRow}>
                    <span>Platform Fee:</span>
                    <span className={styles.fee}>
                      -{payment.currency}{payment.platformFee.toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.paymentRow}>
                    <span>Freelancer Receives:</span>
                    <span className={styles.netAmount}>
                      {payment.currency}{payment.netAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.paymentRow}>
                    <span>Date:</span>
                    <span>
                      {new Date(payment.paidAt || payment.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {payment.status === 'completed' && payment.escrowStatus === 'held' && (
                  <div className={styles.paymentActions}>
                    <button 
                      className={styles.releaseBtn}
                      onClick={() => handleReleasePayment(payment._id)}
                    >
                      <Icon icon="mdi:check-circle" width="18" />
                      Release Payment
                    </button>
                    <button className={styles.viewBtn}>
                      <Icon icon="mdi:eye" width="18" />
                      View Project
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
        </div>
      </div>
    </div>
  );
};

export default ClientWallet;
