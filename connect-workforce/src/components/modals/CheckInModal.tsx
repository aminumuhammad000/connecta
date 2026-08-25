import React, { useState } from 'react';
import { X, CalendarCheck, MapPin, Loader2 } from 'lucide-react';
import { workforceAPI } from '../../api/workforce';
import { useToast } from '../../contexts/ToastContext';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  workforceMemberId?: string;
  workerName?: string;
  onSuccess?: () => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  onClose,
  workforceMemberId,
  workerName,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [action, setAction] = useState<'check-in' | 'check-out'>('check-in');
  const [siteLocation, setSiteLocation] = useState('Abuja Airport Road Project Site');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (action === 'check-in') {
        const res = await workforceAPI.recordCheckIn({
          workforceMemberId,
          location: { lat: 9.0765, lng: 7.3986, address: siteLocation },
          notes,
        });
        showToast(res.message || 'Checked in successfully!', 'success');
      } else {
        const res = await workforceAPI.recordCheckOut({ workforceMemberId });
        showToast(res.message || 'Checked out successfully!', 'success');
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to record attendance', 'error');
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
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">Record Attendance</h2>
            <p className="text-xs text-gray-500">Worker: <strong className="text-gray-900">{workerName || 'Current Member'}</strong></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex rounded-xl bg-gray-100 p-1 font-bold text-xs">
            <button
              type="button"
              onClick={() => setAction('check-in')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                action === 'check-in' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Start Work (Check In)
            </button>
            <button
              type="button"
              onClick={() => setAction('check-out')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                action === 'check-out' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              End Work (Check Out)
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-primary" /> Job Site / Project Location
            </label>
            <input
              type="text"
              value={siteLocation}
              onChange={(e) => setSiteLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Notes / Daily Shift Remarks</label>
            <input
              type="text"
              placeholder="e.g. Electrical wiring completed on Block B"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:outline-none focus:border-primary"
            />
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
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarCheck className="w-4 h-4" />}
              <span>{action === 'check-in' ? 'Check In Now' : 'Check Out Now'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
