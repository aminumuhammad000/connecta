import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useNotification } from '../../contexts/NotificationContext';
import ClientSidebar from '../client/components/ClientSidebar';
import ClientHeader from '../client/components/ClientHeader';
import styles from './styles/PaymentPage.module.css';

interface PaymentData {
  projectId?: string;
  jobId?: string;
  projectTitle: string;
  amount: number;
  freelancerId?: string;
  freelancerName?: string;
  milestoneId?: string;
  description?: string;
  paymentType: 'job_verification' | 'project_payment';
}

const PaymentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showLoader, hideLoader, showError, showSuccess } = useNotification();
  
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [useMockPayment, setUseMockPayment] = useState(false);

  useEffect(() => {
    // Get payment data from URL params or state
    const projectId = searchParams.get('projectId');
    const jobId = searchParams.get('jobId');
    const projectTitle = searchParams.get('projectTitle');
    const amount = searchParams.get('amount');
    const freelancerId = searchParams.get('freelancerId');
    const freelancerName = searchParams.get('freelancerName');
    const milestoneId = searchParams.get('milestoneId');

    // Job verification payment
    if (jobId && amount) {
      setPaymentData({
        jobId,
        projectTitle: projectTitle || 'Job Verification Payment',
        amount: parseFloat(amount),
        paymentType: 'job_verification',
      });
    }
    // Project milestone payment
    else if (projectId && amount && freelancerId) {
      setPaymentData({
        projectId,
        projectTitle: projectTitle || 'Project Payment',
        amount: parseFloat(amount),
        freelancerId,
        freelancerName: freelancerName || 'Freelancer',
        milestoneId: milestoneId || undefined,
        paymentType: 'project_payment',
      });
    }
  }, [searchParams]);

  const handleMockPayment = async () => {
    if (!paymentData) return;

    try {
      setLoading(true);
      showLoader();

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const token = localStorage.getItem('token');
      
      // For job verification, update job directly
      if (paymentData.paymentType === 'job_verification' && paymentData.jobId) {
        // Mock: Just show success and redirect
        hideLoader();
        showSuccess('Payment successful! Job verified.');
        setTimeout(() => {
          navigate('/client/jobs');
        }, 1500);
        return;
      }

      // For project payment, show success
      hideLoader();
      showSuccess('Payment successful! Funds added to escrow.');
      setTimeout(() => {
        navigate('/client/wallet');
      }, 1500);
    } catch (error) {
      console.error('Mock payment error:', error);
      showError('Payment failed. Please try again.');
      hideLoader();
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentData) return;

    // Use mock payment if enabled
    if (useMockPayment) {
      handleMockPayment();
      return;
    }

    try {
      setLoading(true);
      showLoader();

      const token = localStorage.getItem('token');
      // Different endpoints for job verification vs project payment
      const endpoint = paymentData.paymentType === 'job_verification' 
        ? 'http://localhost:5000/api/payments/job-verification'
        : 'http://localhost:5000/api/payments/initialize';

      const body = paymentData.paymentType === 'job_verification'
        ? {
            jobId: paymentData.jobId,
            amount: paymentData.amount,
            description: `Job Verification Payment - ${paymentData.projectTitle}`,
          }
        : {
            projectId: paymentData.projectId,
            milestoneId: paymentData.milestoneId,
            amount: paymentData.amount,
            payeeId: paymentData.freelancerId,
            description: paymentData.description || `Payment for ${paymentData.projectTitle}`,
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to Paystack payment page
        window.location.href = data.data.authorizationUrl;
      } else {
        showError(data.message || 'Failed to initialize payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      showError('Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  if (!paymentData) {
    return (
      <div className={styles.container}>
        <ClientSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className={styles.mainContent}>
          <ClientHeader onMenuClick={() => setSidebarOpen(true)} />
          <div className={styles.content}>
            <div className={styles.errorState}>
              <Icon icon="mdi:alert-circle" width="64" />
              <h2>Invalid Payment Request</h2>
              <p>Missing payment information. Please try again.</p>
              <button onClick={() => navigate(-1)} className={styles.backButton}>
                <Icon icon="mdi:arrow-left" width="20" />
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const platformFee = paymentData.paymentType === 'job_verification' ? 0 : (paymentData.amount * 10) / 100;
  const totalAmount = paymentData.amount;
  const freelancerReceives = paymentData.amount - platformFee;

  return (
    <div className={styles.container}>
      <ClientSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={styles.mainContent}>
        <ClientHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <div className={styles.content}>
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <button onClick={() => navigate(-1)} className={styles.backButton}>
              <Icon icon="mdi:arrow-left" width="20" />
            </button>
            <div>
              <h1 className={styles.pageTitle}>Payment Confirmation</h1>
              <p className={styles.pageSubtitle}>
                {paymentData.paymentType === 'job_verification' ? 'Verify your job posting' : 'Secure payment with escrow protection'}
              </p>
            </div>
          </div>

          {/* Payment Card */}
          <div className={styles.paymentCard}>
            {/* Project Info */}
            <div className={styles.projectSection}>
              <div className={styles.projectIcon}>
                <Icon icon={paymentData.paymentType === 'job_verification' ? 'mdi:briefcase-check' : 'mdi:file-document'} width="40" />
              </div>
              <div className={styles.projectDetails}>
                <h2>{paymentData.projectTitle}</h2>
                {paymentData.freelancerName && (
                  <p className={styles.freelancerName}>
                    <Icon icon="mdi:account" width="16" />
                    Payment to: <strong>{paymentData.freelancerName}</strong>
                  </p>
                )}
                {paymentData.paymentType === 'job_verification' && (
                  <div className={styles.verificationBadge}>
                    <Icon icon="mdi:shield-star" width="16" />
                    Job Verification Payment
                  </div>
                )}
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className={styles.breakdown}>
              <h3>Payment Summary</h3>
              <div className={styles.breakdownList}>
                <div className={styles.breakdownRow}>
                  <span>{paymentData.paymentType === 'job_verification' ? 'Verification Fee' : 'Project Amount'}</span>
                  <span className={styles.amount}>₦{paymentData.amount.toLocaleString()}</span>
                </div>
                {paymentData.paymentType !== 'job_verification' && (
                  <div className={styles.breakdownRow}>
                    <span>
                      Platform Fee (10%)
                      <Icon icon="mdi:information" width="14" className={styles.infoIcon} />
                    </span>
                    <span className={styles.amount}>₦{platformFee.toLocaleString()}</span>
                  </div>
                )}
                <div className={styles.divider}></div>
                <div className={`${styles.breakdownRow} ${styles.total}`}>
                  <span>Total Payment</span>
                  <span className={styles.totalAmount}>₦{totalAmount.toLocaleString()}</span>
                </div>
                {paymentData.paymentType !== 'job_verification' && (
                  <div className={`${styles.breakdownRow} ${styles.freelancerRow}`}>
                    <span>Freelancer Receives</span>
                    <span className={styles.freelancerAmount}>₦{freelancerReceives.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Escrow Info */}
            {paymentData.paymentType !== 'job_verification' && (
              <div className={styles.escrowBox}>
                <div className={styles.escrowIcon}>
                  <Icon icon="mdi:shield-lock" width="24" />
                </div>
                <div className={styles.escrowText}>
                  <h4>Escrow Protection</h4>
                  <p>
                    Your payment will be securely held in escrow until you approve the completed work. 
                    You can release payment or request a refund after reviewing deliverables.
                  </p>
                </div>
              </div>
            )}

            {/* Mock Payment Toggle (Development) */}
            <div className={styles.mockPaymentToggle}>
              <label>
                <input 
                  type="checkbox" 
                  checked={useMockPayment}
                  onChange={(e) => setUseMockPayment(e.target.checked)}
                />
                <span>Use Mock Payment (Testing)</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className={styles.actions}>
              <button
                onClick={() => navigate(-1)}
                className={styles.cancelButton}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                className={styles.payButton}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Icon icon="eos-icons:loading" className={styles.spinner} width="20" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:lock" width="20" />
                    Pay Securely
                  </>
                )}
              </button>
            </div>

            {/* Security Badges */}
            <div className={styles.securityBadges}>
              <div className={styles.securityBadge}>
                <Icon icon="mdi:shield-check" width="20" />
                <span>256-bit SSL Encrypted</span>
              </div>
              <div className={styles.securityBadge}>
                <Icon icon="mdi:bank" width="20" />
                <span>Paystack Secured</span>
              </div>
              <div className={styles.securityBadge}>
                <Icon icon="mdi:shield-lock-outline" width="20" />
                <span>PCI Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
