import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { workforceAPI } from '../api/workforce';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { EmployerHeader } from '../components/employer/EmployerHeader';
import { EmployerSidebar } from '../components/employer/EmployerSidebar';
import { useToast } from '../contexts/ToastContext';
import {
  Users,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock3,
  MapPin,
  Building2,
  Briefcase
} from 'lucide-react';

export const JobApplicantsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [job, setJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) {
      fetchJobDetailsAndApplicants();
    }
  }, [jobId]);

  const fetchJobDetailsAndApplicants = async () => {
    setLoading(true);
    try {
      const [jobsRes, applicantsRes] = await Promise.allSettled([
        workforceAPI.getJobs(),
        workforceAPI.getJobApplicants(jobId!),
      ]);

      if (jobsRes.status === 'fulfilled' && jobsRes.value?.data) {
        const foundJob = jobsRes.value.data.find((j: any) => String(j._id) === String(jobId));
        setJob(foundJob || null);
      }

      if (applicantsRes.status === 'fulfilled' && applicantsRes.value?.data) {
        setApplicants(applicantsRes.value.data);
      }
    } catch (err) {
      console.error('Failed to fetch job applicants:', err);
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
          ? `Hired ${workerName}. Worker added to your roster.`
          : `Proposal from ${workerName} declined.`,
        status === 'accepted' ? 'success' : 'info'
      );
      setApplicants((prev) =>
        prev.map((p) => (p._id === proposalId ? { ...p, status } : p))
      );
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update applicant status', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f8] text-gray-800 font-sans p-4 md:p-6">
      {/* TOP BRAND NAVBAR */}
      <EmployerHeader />

      {/* MAIN CONTENT GRID CONTAINER */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT SIDEBAR */}
        <EmployerSidebar />

        {/* CENTER CONTENT */}
        <main className="lg:col-span-9 space-y-6">
          {/* MINIMALIST BACK LINK */}
          <button
            onClick={() => navigate('/employer/jobs')}
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Jobs</span>
          </button>

          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
              <p className="text-xs font-semibold">Loading job applicants...</p>
            </div>
          ) : !job ? (
            <EmptyState
              icon={Briefcase}
              title="Job not found"
              description="The requested job opening could not be found."
            />
          ) : (
            <>
              {/* MINIMALIST JOB HEADER CARD */}
              <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-gray-500 bg-gray-50 px-2.5 py-0.5 rounded-full border border-gray-200">
                        {job.category || 'Workforce Opening'}
                      </span>
                      <StatusBadge status={job.status || 'active'} />
                    </div>
                    <h1 className="text-xl font-extrabold text-gray-900 leading-tight">{job.title}</h1>
                    <div className="flex items-center gap-4 text-xs text-gray-400 font-medium pt-0.5">
                      <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {job.companyName || 'PayFlow'}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location || 'Site Base'}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50/60 p-3.5 rounded-2xl border border-gray-100 shrink-0 space-y-0.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Pay Rate</span>
                    <span className="text-lg font-black text-emerald-600">
                      ₦ {(job.budget || 0).toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">/ month</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                  <span>Applicants: <strong className="text-gray-900">{applicants.length} Workers</strong></span>
                  <span>Posted {new Date(job.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>

              {/* MINIMALIST APPLICANTS TABLE */}
              <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="font-extrabold text-base text-gray-900">Applicants</h3>
                  <p className="text-xs text-gray-500 font-medium">Review worker applications and hire candidates onto your roster.</p>
                </div>

                {applicants.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No applicants yet"
                    description="Workers applying to this position on their portal will show up here."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-medium">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider font-bold">
                          <th className="py-3 px-3">Applicant</th>
                          <th className="py-3 px-3">Rate</th>
                          <th className="py-3 px-3">Pitch</th>
                          <th className="py-3 px-3">Status</th>
                          <th className="py-3 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-gray-700">
                        {applicants.map((p) => {
                          const worker = p.freelancerId || p.worker;
                          const workerName = worker ? `${worker.firstName || ''} ${worker.lastName || ''}`.trim() : 'Worker Applicant';
                          const isAccepted = p.status === 'accepted' || p.status === 'hired';
                          const isDeclined = p.status === 'declined' || p.status === 'rejected';

                          return (
                            <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="py-3.5 px-3 font-bold text-gray-900">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-orange-100 text-primary font-bold flex items-center justify-center text-xs overflow-hidden shrink-0">
                                    {worker?.profileImage ? (
                                      <img src={worker.profileImage} alt={workerName} className="w-full h-full object-cover" />
                                    ) : (
                                      (workerName || 'W')[0]
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-extrabold text-gray-900 text-sm">{workerName}</div>
                                    <div className="text-[11px] text-gray-400 font-normal">{worker?.email || worker?.phoneNumber || 'Verified Worker'}</div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-3 font-extrabold text-emerald-600 text-sm">
                                ₦ {(p.price || job.budget || 0).toLocaleString()}
                              </td>

                              <td className="py-3.5 px-3 text-gray-500 max-w-xs truncate font-medium">
                                {p.description || 'Applied via Connecta 1-Tap Apply'}
                              </td>

                              <td className="py-3.5 px-3">
                                {isAccepted ? (
                                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[11px] inline-flex items-center gap-1 border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3" /> Hired
                                  </span>
                                ) : isDeclined ? (
                                  <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 font-bold text-[11px] inline-flex items-center gap-1 border border-rose-200">
                                    <XCircle className="w-3 h-3" /> Declined
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 font-bold text-[11px] inline-flex items-center gap-1 border border-amber-200">
                                    <Clock3 className="w-3 h-3" /> Under Review
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 px-3 text-right space-x-2">
                                {!isAccepted && !isDeclined ? (
                                  <>
                                    <button
                                      onClick={() => handleUpdateStatus(p._id, 'accepted', workerName)}
                                      disabled={actionLoadingId === p._id}
                                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all inline-flex items-center gap-1 disabled:opacity-50"
                                    >
                                      {actionLoadingId === p._id ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <>
                                          <CheckCircle2 className="w-3.5 h-3.5" />
                                          <span>Hire</span>
                                        </>
                                      )}
                                    </button>

                                    <button
                                      onClick={() => handleUpdateStatus(p._id, 'declined', workerName)}
                                      disabled={actionLoadingId === p._id}
                                      className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-xs border border-gray-200 transition-all inline-flex items-center gap-1 disabled:opacity-50"
                                    >
                                      <XCircle className="w-3.5 h-3.5 text-gray-400" />
                                      <span>Reject</span>
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-[11px] text-gray-400 font-medium">No actions pending</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};
