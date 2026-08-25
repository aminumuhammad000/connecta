import React, { useState } from 'react';
import { X, CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import { workforceAPI } from '../../api/workforce';
import { useToast } from '../../contexts/ToastContext';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  workforceMemberId?: string;
  workerName?: string;
  defaultAmount?: number;
  onSuccess?: () => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  workforceMemberId = '',
  workerName = '',
  defaultAmount = 150000,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [amount, setAmount] = useState(String(defaultAmount));
  const [paymentType, setPaymentType] = useState('monthly');
  const [currency, setCurrency] = useState('NGN');
  const [description, setDescription] = useState('Monthly Payroll Disbursement');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workforceMemberId || Number(amount) <= 0) {
      showToast('Please select a worker and valid payment amount', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await workforceAPI.processPayment({
        workforceMemberId,
        amount: Number(amount),
        paymentType,
        currency,
        description,
      });

      if (res.success) {
        showToast(res.message || 'Payment recorded successfully!', 'success');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        showToast(res.message || 'Payment failed', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to record payment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 border border-gray-200 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">Pay Worker</h2>
            <p className="text-xs text-gray-500">Record Payout for <strong className="text-gray-900">{workerName || 'Worker'}</strong></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Payment Amount *</label>
              <input
                type="number"
                required
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Currency</label>
              <select
                value="NGN"
                disabled
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-bold text-gray-900"
              >
                <option value="NGN">NGN (₦)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Payment Arrangement</label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:outline-none focus:border-primary"
            >
              <option value="monthly">Monthly Salary</option>
              <option value="weekly">Weekly Wages</option>
              <option value="daily">Daily Stipend</option>
              <option value="hourly">Hourly Rate</option>
              <option value="milestone">Milestone Release</option>
              <option value="one_time">One-time Bonus</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Payment Notes / Description</label>
            <input
              type="text"
              placeholder="e.g. August 2026 Salary Payout"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:outline-none focus:border-primary"
            />
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Connecta Wallet / Flutterwave Escrow verification attached.</span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} type="button" className="px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-xs text-gray-700 hover:bg-gray-100">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              <span>Process Payout</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
