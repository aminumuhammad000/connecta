import React, { useEffect, useState } from 'react';
import { X, Users, CheckCircle2, XCircle, Loader2, Clock3 } from 'lucide-react';
import { workforceAPI } from '../../api/workforce';
import { useToast } from '../../contexts/ToastContext';

interface JobApplicantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: any;
  onStatusUpdated?: () => void;
}

export const JobApplicantsModal: React.FC<JobApplicantsModalProps> = ({
  isOpen,
  onClose,
  job,
  onStatusUpdated,
}) => {
  const { showToast } = useToast();
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && job?._id) {
      fetchApplicants();
    }
  }, [isOpen, job]);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const res = await workforceAPI.getJobApplicants(job._id);
      if (res?.data) {
        setApplicants(res.data);
      } else {
        setApplicants([]);
      }
    } catch (err) {
      console.error('Failed to fetch job applicants:', err);
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (proposalId: string, status: 'accepted' | 'declined', workerName: string) => {
    setActionLoadingId(proposalId);
    try {
      await workforceAPI.updateProposalStatus(proposalId, status);
      showToast(
        status === 'accepted'
          ? `🎉 Hired ${workerName}! Worker added to your Employees Roster.`
          : `Proposal from ${workerName} declined.`,
        status === 'accepted' ? 'success' : 'info'
      );
      setApplicants((prev) =>
        prev.map((p) => (p._id === proposalId ? { ...p, status } : p))
      );
      if (onStatusUpdated) onStatusUpdated();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update applicant status', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col justify-between">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-primary flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-lg leading-tight">Job Applicants</h3>
              <p className="text-xs text-gray-500 font-medium">Review and hire workers for: <span className="font-bold text-gray-800">{job.title}</span></p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT LIST */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
              <p className="text-xs font-semibold">Fetching job applicants from database...</p>
            </div>
          ) : applicants.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-3 bg-gray-50/60 rounded-2xl border border-dashed border-gray-200">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-primary flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h4 className="font-extrabold text-gray-900 text-base">No Applications Received Yet</h4>
                <p className="text-xs text-gray-500">Workers browsing open jobs on their portal will show up here as soon as they submit applications.</p>
              </div>
            </div>
          ) : (
            applicants.map((p) => {
              const worker = p.freelancerId || p.worker;
              const workerName = worker ? `${worker.firstName || ''} ${worker.lastName || ''}`.trim() : 'Worker Applicant';
              const isAccepted = p.status === 'accepted' || p.status === 'hired';
              const isDeclined = p.status === 'declined' || p.status === 'rejected';

              return (
                <div key={p._id} className="bg-gray-50/80 rounded-2xl p-4 border border-gray-200/80 space-y-3 shadow-xs hover:border-primary/40 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-orange-100 text-primary font-extrabold flex items-center justify-center text-sm overflow-hidden shrink-0">
                        {worker?.profileImage ? (
                          <img src={worker.profileImage} alt={workerName} className="w-full h-full object-cover" />
                        ) : (
                          (workerName || 'W')[0]
                        )}
                      </div>

                      <div>
                        <h4 className="font-black text-gray-900 text-base leading-tight">{workerName}</h4>
                        <p className="text-xs text-gray-500 font-semibold">{worker?.email || worker?.phoneNumber || 'Verified Job Applicant'}</p>
                      </div>
                    </div>

                    {/* STATUS BADGE */}
                    {isAccepted ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Hired
                      </span>
                    ) : isDeclined ? (
                      <span className="px-3 py-1 rounded-full bg-rose-500 text-white font-extrabold text-xs flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Declined
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-amber-500 text-white font-extrabold text-xs flex items-center gap-1">
                        <Clock3 className="w-3.5 h-3.5" /> Under Review
                      </span>
                    )}
                  </div>

                  <div className="bg-white rounded-xl p-3 border border-gray-200/60 flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-500">Proposed Rate:</span>
                    <span className="font-black text-emerald-600 text-sm">
                      {job.currency || 'NGN'} {(p.price || job.budget || 0).toLocaleString()} <span className="text-[10px] text-gray-400 font-semibold">/ month</span>
                    </span>
                  </div>

                  {p.description && (
                    <p className="text-xs text-gray-600 bg-white p-3 rounded-xl border border-gray-200/60 leading-relaxed font-medium">
                      "{p.description}"
                    </p>
                  )}

                  {/* ACTION BUTTONS */}
                  {!isAccepted && !isDeclined && (
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={() => handleUpdateStatus(p._id, 'accepted', workerName)}
                        disabled={actionLoadingId === p._id}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {actionLoadingId === p._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Hire Worker</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(p._id, 'declined', workerName)}
                        disabled={actionLoadingId === p._id}
                        className="py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs border border-rose-200 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-extrabold text-xs transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
