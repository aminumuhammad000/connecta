import React, { useEffect, useState } from 'react';
import { X, Briefcase, Loader2, Building2 } from 'lucide-react';
import { workforceAPI } from '../../api/workforce';
import { useToast } from '../../contexts/ToastContext';

interface EditJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: any;
  onSuccess?: () => void;
}

export const EditJobModal: React.FC<EditJobModalProps> = ({
  isOpen,
  onClose,
  job,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [openings, setOpenings] = useState('1');
  const [jobType, setJobType] = useState('contract');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (job) {
      setTitle(job.title || '');
      setCategory(job.category || 'Construction & Engineering');
      setBudget(String(job.budget || 200000));
      setOpenings(String(job.openings || 1));
      setJobType(job.jobType || 'contract');
      setLocation(job.location || 'Lagos, Nigeria');
      setDescription(job.description || '');
    }
  }, [job]);

  if (!isOpen || !job) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || Number(budget) <= 0) {
      showToast('Please enter a valid position title and budget', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await workforceAPI.updateJob(job._id, {
        title,
        category,
        budget: Number(budget),
        openings: Number(openings || 1),
        jobType,
        location,
        description,
      });

      showToast(`Job "${title}" updated successfully!`, 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update job', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-primary flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-base">Edit Job Opening</h3>
              <p className="text-xs text-gray-500 font-medium">Update details for position</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Position / Role Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Site Operations Manager"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Industry Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:outline-none focus:border-primary"
              >
                <option value="Construction & Engineering">Construction & Engineering</option>
                <option value="Logistics & Supply">Logistics & Supply</option>
                <option value="Hospitality & Events">Hospitality & Events</option>
                <option value="Security & Cleaning">Security & Cleaning</option>
                <option value="Retail & Sales">Retail & Sales</option>
                <option value="IT & Operations">IT & Operations</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Job Type / Agreement *</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:outline-none focus:border-primary"
              >
                <option value="contract">Formal Contract (Monthly Salary)</option>
                <option value="normal_job">Milestone Job (One-Off Project)</option>
                <option value="daily">Daily Wage Contract</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Pay Rate (₦) *</label>
              <input
                type="number"
                required
                min="1000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="250000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold text-emerald-600 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Workers Needed *</label>
              <input
                type="number"
                required
                min="1"
                value={openings}
                onChange={(e) => setOpenings(e.target.value)}
                placeholder="5"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold text-primary focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Location / Site *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Lagos, Nigeria"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Job Description & Responsibilities</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe daily duties, work hours, and qualifications needed..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:outline-none focus:border-primary"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save Changes</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
