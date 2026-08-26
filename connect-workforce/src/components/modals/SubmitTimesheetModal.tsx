import React, { useState } from 'react';
import { X, Clock, Loader2, Send } from 'lucide-react';
import { workforceAPI } from '../../api/workforce';
import { useToast } from '../../contexts/ToastContext';

interface SubmitTimesheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SubmitTimesheetModal: React.FC<SubmitTimesheetModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hours, setHours] = useState('8');
  const [overtimeHours, setOvertimeHours] = useState('0');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const h = Number(hours) || 0;
    const ot = Number(overtimeHours) || 0;

    if (h <= 0 && ot <= 0) {
      showToast('Please enter valid work or overtime hours.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await workforceAPI.recordCheckIn({
        notes: `Timesheet Entry [Date: ${date} | Regular: ${h}hrs | Overtime: ${ot}hrs] - ${notes}`.trim(),
      });

      if (res?.success) {
        showToast(`Timesheet for ${date} submitted for approval!`, 'success');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        showToast(res?.message || 'Failed to submit timesheet', 'error');
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to submit timesheet', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-primary flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-gray-900 leading-tight">Submit Timesheet & Overtime</h2>
              <p className="text-xs text-gray-400 font-medium">Log extra hours for employer approval.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-700 font-bold mb-1">Work Date *</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold text-gray-900 focus:outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Regular Hours Worked *</label>
              <input
                type="number"
                min="0"
                max="24"
                required
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 font-bold text-gray-900 focus:outline-none focus:border-primary focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Overtime Hours</label>
              <input
                type="number"
                min="0"
                max="24"
                value={overtimeHours}
                onChange={(e) => setOvertimeHours(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-orange-50/60 border border-orange-200 font-bold text-primary focus:outline-none focus:border-primary focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1">Task Summary / Notes</label>
            <textarea
              rows={3}
              placeholder="Describe work completed or reason for overtime..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 font-medium text-gray-900 focus:outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover text-white font-extrabold text-xs shadow-md shadow-primary/20 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Timesheet</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
