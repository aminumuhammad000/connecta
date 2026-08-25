import React, { useState } from 'react';
import { X, Briefcase, Loader2, Globe, Users } from 'lucide-react';
import { workforceAPI } from '../../api/workforce';
import { useToast } from '../../contexts/ToastContext';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Construction & Engineering');
  const [jobType, setJobType] = useState('contract');
  const [budget, setBudget] = useState('150000');
  const [duration, setDuration] = useState('30');
  const [openings, setOpenings] = useState('5');
  const [location, setLocation] = useState('Abuja, Nigeria');
  const [skills, setSkills] = useState('Electrical, Installation, Maintenance');
  const [publishToMarketplace, setPublishToMarketplace] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Please enter a job title and detailed description', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await workforceAPI.createJob({
        title,
        description,
        category,
        jobType,
        budget: Number(budget),
        duration: Number(duration),
        openings: Number(openings || 1),
        location,
        skills: skills.split(',').map((s) => s.trim()),
        paymentVerified: true,
        publishToMarketplace,
      });

      if (res.success || res.data) {
        showToast('Job listing created successfully!', 'success');
        if (onSuccess) onSuccess();
        onClose();
        setTitle('');
        setDescription('');
      } else {
        showToast(res.message || 'Failed to create job', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create job', 'error');
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
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">Create Job / Project Role</h2>
            <p className="text-xs text-gray-500">Define job terms and hire from existing team or Connecta marketplace.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Job Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Electrician — Airport Road Project"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Industry / Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:outline-none focus:border-primary"
              >
                <option value="Construction & Engineering">Construction & Engineering</option>
                <option value="Logistics & Supply">Logistics & Supply</option>
                <option value="Development & IT">Development & IT</option>
                <option value="Security & Cleaning">Security & Cleaning</option>
                <option value="Hospitality & Events">Hospitality & Events</option>
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
              <label className="block text-xs font-bold text-gray-700 mb-1">Budget Pay (₦)</label>
              <input
                type="number"
                required
                min="0"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold focus:outline-none focus:border-primary"
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
              <label className="block text-xs font-bold text-gray-700 mb-1">Duration (Days)</label>
              <input
                type="number"
                required
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Location / Site Base</label>
            <input
              type="text"
              placeholder="e.g. Abuja, Nigeria"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Required Skills (Comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. Wiring, Solar Installation, High Voltage"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Scope & Deliverables Summary *</label>
            <textarea
              required
              rows={3}
              placeholder="Describe what the job entails and expectations..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:outline-none focus:border-primary"
            />
          </div>

          {/* Visibility Options */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={publishToMarketplace}
                onChange={(e) => setPublishToMarketplace(e.target.checked)}
                className="rounded accent-primary w-4 h-4"
              />
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-primary" /> Publish to Connecta Marketplace (Receive Applications)
              </span>
            </label>
            <p className="text-[11px] text-gray-500 pl-6">
              When checked, top professionals on Connecta can apply. You can also assign your existing workforce directly.
            </p>
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
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4" />}
              <span>Publish Job</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
