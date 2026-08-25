import React, { useState } from 'react';
import { X, FileText, Loader2, ShieldCheck } from 'lucide-react';
import { workforceAPI } from '../../api/workforce';
import { useToast } from '../../contexts/ToastContext';

interface CreateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  workforceMemberId?: string;
  workerName?: string;
  onSuccess?: () => void;
}

export const CreateContractModal: React.FC<CreateContractModalProps> = ({
  isOpen,
  onClose,
  workforceMemberId = '',
  workerName = '',
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [jobTitle, setJobTitle] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('150000');
  const [paymentType, setPaymentType] = useState('monthly');
  const [currency, setCurrency] = useState('NGN');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [responsibilities, setResponsibilities] = useState('Site maintenance, electrical wiring, safety checks, team reporting.');
  const [terms, setTerms] = useState('Notice period: 30 days. Payout disbursed on 28th of every month. Standard Connecta Digital Terms apply.');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workforceMemberId) {
      showToast('No worker selected for contract', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await workforceAPI.createContract({
        workforceMemberId,
        jobTitle: jobTitle || 'Workforce Specialist',
        startDate,
        endDate: endDate || undefined,
        paymentType,
        paymentAmount: Number(paymentAmount),
        currency,
        responsibilities,
        terms,
      });

      if (res.success) {
        showToast('Digital contract generated and sent to worker!', 'success');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        showToast(res.message || 'Failed to create contract', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create contract', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 border border-gray-200 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">Create Digital Contract</h2>
            <p className="text-xs text-gray-500">Contract Offer for <strong className="text-gray-900">{workerName || 'Worker'}</strong></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Position / Contract Role *</label>
            <input
              type="text"
              required
              placeholder="e.g. Lead Site Electrician"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">End Date (Optional)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Compensation</label>
              <input
                type="number"
                required
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm font-bold focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Payment Schedule</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="w-full px-2 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold focus:outline-none focus:border-primary"
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
                <option value="hourly">Hourly</option>
                <option value="milestone">Milestone</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-2 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold focus:outline-none focus:border-primary"
              >
                <option value="NGN">NGN (₦)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Key Responsibilities</label>
            <textarea
              rows={2}
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Contract Terms & Conditions</label>
            <textarea
              rows={2}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:outline-none focus:border-primary"
            />
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Digital signature & notification will be dispatched instantly via Connecta.</span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} type="button" className="px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-xs text-gray-700 hover:bg-gray-100">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-hover shadow-md shadow-primary/20"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              <span>Issue Contract</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
