import React, { useState } from 'react';
import { X, UserPlus, Loader2, Sparkles } from 'lucide-react';
import { workforceAPI } from '../../api/workforce';
import { useToast } from '../../contexts/ToastContext';

interface AddWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddWorkerModal: React.FC<AddWorkerModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [employmentType, setEmploymentType] = useState('contract');
  const [paymentType, setPaymentType] = useState('monthly');
  const [paymentAmount, setPaymentAmount] = useState('150000');
  const [currency, setCurrency] = useState('NGN');
  const [location, setLocation] = useState('');
  const [idNumber, setIdNumber] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !role.trim()) {
      showToast('Please fill out all required fields (*)', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await workforceAPI.addWorker({
        fullName,
        email,
        phone,
        role,
        employmentType,
        paymentType,
        paymentAmount: Number(paymentAmount),
        currency,
        location,
        idNumber,
      });

      if (res.success) {
        showToast(res.message || 'Worker added to workforce successfully!', 'success');
        if (onSuccess) onSuccess();
        onClose();
        // Reset form
        setFullName('');
        setEmail('');
        setPhone('');
        setRole('');
      } else {
        showToast(res.message || 'Failed to add worker', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to add worker', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 border border-gray-200 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">Add Worker to Workforce</h2>
            <p className="text-xs text-gray-500">Manually add an existing team member or send a Connecta invite.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Musa Ibrahim"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="musa@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+234 801 234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Job Role / Position *</label>
              <input
                type="text"
                required
                placeholder="e.g. Site Electrician"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Employment Arrangement</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:outline-none focus:border-primary"
              >
                <option value="full_time">Full-Time</option>
                <option value="part_time">Part-Time</option>
                <option value="contract">Contractor</option>
                <option value="temporary">Temporary Worker</option>
                <option value="project">Project-based</option>
                <option value="daily">Daily Hire</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Payment Type</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:outline-none focus:border-primary"
              >
                <option value="monthly">Monthly Salary</option>
                <option value="weekly">Weekly Retainer</option>
                <option value="daily">Daily Wage</option>
                <option value="hourly">Hourly Rate</option>
                <option value="milestone">Milestone Payout</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Payment Amount</label>
              <input
                type="number"
                required
                min="0"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:outline-none focus:border-primary"
              >
                <option value="NGN">NGN (₦)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="KES">KES (KSh)</option>
                <option value="GHS">GHS (₵)</option>
              </select>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-xs text-gray-700 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>
              If this worker already has a Connecta account, their profile & work history will automatically connect seamlessly.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-xs text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-hover shadow-md shadow-primary/20"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              <span>Add Worker</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
