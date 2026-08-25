import React, { useEffect, useState } from 'react';
import { workforceAPI } from '../api/workforce';
import { StatusBadge } from '../components/common/StatusBadge';
import { CheckInModal } from '../components/modals/CheckInModal';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../contexts/ToastContext';
import { CalendarCheck, MapPin, Clock, Plus, Loader2 } from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const { showToast } = useToast();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await workforceAPI.getAttendance({ date: selectedDate });
      if (res?.data) {
        setAttendance(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkStatus = async (workforceMemberId: string, status: string) => {
    try {
      const res = await workforceAPI.markAttendance({ workforceMemberId, date: selectedDate, status });
      showToast(res.message || `Marked as ${status}`, 'success');
      fetchAttendance();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to mark attendance', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Attendance & Shift Tracker</h1>
          <p className="text-xs text-gray-500 font-medium">Track worker check-ins, job site locations, and absences.</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-gray-300 bg-white font-bold text-xs text-gray-800 shadow-xs focus:outline-none"
          />

          <button
            onClick={() => setCheckInModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-md shadow-primary/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Check-In</span>
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
            <p className="text-xs font-semibold">Loading attendance records...</p>
          </div>
        ) : attendance.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title={`No attendance records for ${selectedDate}`}
            description="Record worker check-in for today's shift or override worker status."
            actionText="Record Check-In"
            onAction={() => setCheckInModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="py-3.5 px-6">Worker</th>
                  <th className="py-3.5 px-6">Check-In Time</th>
                  <th className="py-3.5 px-6">Check-Out Time</th>
                  <th className="py-3.5 px-6">Location</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Quick Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-800">
                {attendance.map((r) => {
                  const m = r.workforceMemberId;
                  return (
                    <tr key={r._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-gray-900">
                        {m?.fullName || 'Worker'}
                        <div className="text-[11px] text-gray-400 font-normal">{m?.role}</div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="flex items-center gap-1 font-bold text-gray-800">
                          <Clock className="w-3.5 h-3.5 text-emerald-500" />
                          {r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span className="flex items-center gap-1 font-bold text-gray-800">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                          {r.location?.address || 'Site Configured'}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <StatusBadge status={r.status} />
                      </td>

                      <td className="py-4 px-6 text-right space-x-1">
                        <button
                          onClick={() => handleMarkStatus(m?._id || r.workforceMemberId, 'present')}
                          className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg"
                        >
                          Present
                        </button>
                        <button
                          onClick={() => handleMarkStatus(m?._id || r.workforceMemberId, 'absent')}
                          className="px-2.5 py-1 text-[11px] font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg"
                        >
                          Absent
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CheckInModal isOpen={checkInModalOpen} onClose={() => setCheckInModalOpen(false)} onSuccess={fetchAttendance} />
    </div>
  );
};
