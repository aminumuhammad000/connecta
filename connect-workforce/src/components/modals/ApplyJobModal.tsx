import React, { useState } from 'react';
import { X, Briefcase, Loader2, ArrowRight } from 'lucide-react';
import { workforceAPI } from '../../api/workforce';
import { useToast } from '../../contexts/ToastContext';

interface ApplyJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: any;
  onSuccess?: () => void;
}

export const ApplyJobModal: React.FC<ApplyJobModalProps> = ({
  isOpen,
  onClose,
  job,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [price, setPrice] = useState(String(job?.budget || 200000));
  const [pitch, setPitch] = useState('I am experienced in this role and available to start immediately.');

  if (!isOpen || !job) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(price) <= 0) {
      showToast('Please enter a valid rate', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await workforceAPI.applyForJob(job._id, Number(price));
      if (res.success || res.data) {
        showToast(`Application submitted for "${job.title}"!`, 'success');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        showToast(res.message || 'Failed to submit application', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to apply for job', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-gray-100 relative">
        {/* CLOSE BUTTON */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 text-primary font-black flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900 text-base leading-tight">Apply for Opening</h3>
            <p className="text-xs text-gray-400 font-medium truncate max-w-[240px]">{job.title}</p>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Your Proposed Monthly Rate (₦) *</label>
            <input
              type="number"
              required
              min="1000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-black text-emerald-600 focus:outline-none focus:border-primary focus:bg-white transition-all"
            />
            <span className="text-[11px] text-gray-400 mt-1 block">Budget posted by employer: ₦ {(job.budget || 0).toLocaleString()} / month</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Application Pitch & Experience *</label>
            <textarea
              rows={3}
              required
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder="State your past experience and availability..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium focus:outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-2xl bg-primary hover:bg-primary-hover text-white font-extrabold text-xs shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Submit Application to Employer</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
