import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, DollarSign, ShieldCheck, Loader2, Send } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { authAPI } from '../../services/api';
import { formatCurrency } from '../../utils/currency';

interface EmploymentOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: string;
  freelancerName: string;
  jobTitle: string;
  defaultSalary?: number;
  onSuccess?: () => void;
}

export const EmploymentOfferModal: React.FC<EmploymentOfferModalProps> = ({
  isOpen,
  onClose,
  proposalId,
  freelancerName,
  jobTitle,
  defaultSalary = 2500,
  onSuccess
}) => {
  const { success, error } = useToast();
  const [monthlySalary, setMonthlySalary] = useState(defaultSalary);
  const [probationDays, setProbationDays] = useState(30);
  const [noticeDays, setNoticeDays] = useState(30);
  const [currency, setCurrency] = useState('USD');
  const [benefitsSummary, setBenefitsSummary] = useState('Paid annual leave, remote work stipend, health insurance reimbursement.');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        proposalId,
        title: `Full-Time Employment: ${jobTitle}`,
        description: `Official Full-Time Remote Employment Agreement for ${freelancerName}.\nMonthly Salary: ${formatCurrency(monthlySalary, currency)}/month.\nProbation Period: ${probationDays} Days.\nNotice Period: ${noticeDays} Days.\nBenefits: ${benefitsSummary}`,
        monthlySalaryAmount: monthlySalary,
        contractType: 'full_time_contract',
        billingCycle: 'monthly',
        probationPeriodDays: probationDays,
        noticePeriodDays: noticeDays,
        currency
      };

      const res = await authAPI.createOffer(payload);
      if (res.success) {
        success('Offer Sent!', `Employment Offer Letter sent successfully to ${freelancerName}`);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        error('Failed', res.message || 'Could not send offer letter');
      }
    } catch (err: any) {
      error('Error', err.message || 'Failed to generate offer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass-card"
          style={{
            maxWidth: '600px',
            width: '100%',
            padding: '32px',
            position: 'relative',
            borderRadius: 'var(--radius-xl)'
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(253, 103, 48, 0.2) 0%, rgba(229, 82, 27, 0.1) 100%)',
              border: '1px solid rgba(253, 103, 48, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--primary)'
            }}>
              <FileText size={28} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Send Official Employment Offer Letter
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Contract Offer for <strong style={{ color: 'var(--text-primary)' }}>{freelancerName}</strong> ({jobTitle})
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Monthly Retainer Salary *</label>
                <div className="input-wrapper">
                  <DollarSign className="input-icon-left" size={18} />
                  <input
                    type="number"
                    required
                    min="100"
                    value={monthlySalary}
                    onChange={(e) => setMonthlySalary(Number(e.target.value))}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="input-field"
                  style={{ fontWeight: 700 }}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="NGN">NGN (₦)</option>
                  <option value="KES">KES (KSh)</option>
                  <option value="GHS">GHS (₵)</option>
                  <option value="ZAR">ZAR (R)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Probation Period (Days)</label>
                <input
                  type="number"
                  value={probationDays}
                  onChange={(e) => setProbationDays(Number(e.target.value))}
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notice Period (Days)</label>
                <input
                  type="number"
                  value={noticeDays}
                  onChange={(e) => setNoticeDays(Number(e.target.value))}
                  className="input-field"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Benefits & Perks Summary</label>
              <textarea
                value={benefitsSummary}
                onChange={(e) => setBenefitsSummary(e.target.value)}
                className="input-field"
                rows={3}
              />
            </div>

            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              fontSize: '0.82rem',
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <ShieldCheck size={18} style={{ flexShrink: 0 }} />
              <span>Full-time contracts hold 1 month's salary in advance in Connecta Escrow before start date.</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 'var(--radius-lg)',
                fontWeight: 700,
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              Generate & Issue Offer Letter
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
