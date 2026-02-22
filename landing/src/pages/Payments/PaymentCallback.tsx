import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useNotification } from '../../contexts/NotificationContext';
import styles from './styles/PaymentCallback.module.css';

const PaymentCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showError, showSuccess } = useNotification();
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    const reference = searchParams.get('reference');
    
    if (!reference) {
      setStatus('failed');
      setMessage('Invalid payment reference');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/payments/verify/${reference}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage('Payment successful! Funds have been added to escrow.');
        showSuccess('Payment completed successfully');
        
        // Redirect to projects page after 3 seconds
        setTimeout(() => {
          navigate('/client/projects');
        }, 3000);
      } else {
        setStatus('failed');
        setMessage(data.message || 'Payment verification failed');
        showError('Payment verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('failed');
      setMessage('Failed to verify payment. Please contact support.');
      showError('Payment verification error');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {status === 'verifying' && (
          <>
            <Icon icon="mdi:loading" className={styles.spinner} width="64" />
            <h2>Verifying Payment</h2>
            <p>{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className={styles.successIcon}>
              <Icon icon="mdi:check-circle" width="64" />
            </div>
            <h2>Payment Successful!</h2>
            <p>{message}</p>
            <div className={styles.info}>
              <Icon icon="mdi:information" width="20" />
              <span>Redirecting you to your projects...</span>
            </div>
            <button onClick={() => navigate('/client/projects')} className={styles.btn}>
              Go to Projects Now
            </button>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className={styles.errorIcon}>
              <Icon icon="mdi:alert-circle" width="64" />
            </div>
            <h2>Payment Failed</h2>
            <p>{message}</p>
            <div className={styles.actions}>
              <button onClick={() => navigate('/client/projects')} className={styles.btn}>
                Back to Projects
              </button>
              <button onClick={() => window.location.reload()} className={styles.retryBtn}>
                Try Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;
