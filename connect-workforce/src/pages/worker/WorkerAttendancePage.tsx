import React, { useEffect, useState } from 'react';
import { workforceAPI } from '../../api/workforce';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CalendarCheck, Clock, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WorkerAttendancePage: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkerData();
  }, []);

  const fetchWorkerData = async () => {
    setLoading(true);
    try {
      const res = await workforceAPI.getWorkerMe();
      if (res?.data?.attendanceHistory) {
        setHistory(res.data.attendanceHistory);
      }
    } catch (err) {
      console.error('Failed to fetch attendance history:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link to="/workforce/me" className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" /> Back to My Work
      </Link>

      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Attendance History</h1>
        <p className="text-xs text-gray-500 font-medium">Your shift check-in and check-out records.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
            <p className="text-xs font-semibold">Loading shift history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <CalendarCheck className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="font-bold text-sm text-gray-800">No shift records yet</p>
            <p className="text-xs text-gray-500 mt-0.5">Start work from your home screen to log attendance.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {history.map((h) => (
              <div key={h._id} className="p-4 flex items-center justify-between hover:bg-gray-50/50">
                <div>
                  <div className="font-bold text-sm text-gray-900">{h.date}</div>
                  <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      In: {h.checkInTime ? new Date(h.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-gray-600 font-medium">
                      Out: {h.checkOutTime ? new Date(h.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </span>
                  </div>
                </div>
                <StatusBadge status={h.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
