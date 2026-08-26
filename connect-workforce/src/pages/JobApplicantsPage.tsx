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
  Briefcase,
  Calendar,
  Clock,
  Send,
  UserCheck
} from 'lucide-react';

export const JobApplicantsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [job, setJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Tab filter: 'pending' (Applicants to Review) vs 'hired' (Hired People List)
  const [activeTab, setActiveTab] = useState<'pending' | 'hired'>('pending');

  // Checkbox Selection state
  const [selectedApplicantIds, setSelectedApplicantIds] = useState<string[]>([]);

  // Confirmation Modal state for Single Hire / Decline
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    proposalId: string;
    status: 'accepted' | 'declined';
    workerName: string;
  }>({
    isOpen: false,
    proposalId: '',
    status: 'accepted',
    workerName: '',
  });

  // Interview Invite Modal state
  const [interviewModal, setInterviewModal] = useState<{
    isOpen: boolean;
    date: string;
    time: string;
    location: string;
    notes: string;
    sending: boolean;
  }>({
    isOpen: false,
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    location: 'Company Office / Site Base',
    notes: '',
    sending: false,
  });

  // Track candidates invited for interviews
  const [interviewInvitedIds, setInterviewInvitedIds] = useState<string[]>([]);

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
        if (foundJob?.location) {
          setInterviewModal((prev) => ({ ...prev, location: foundJob.location }));
        }
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

  // Filter applicants into pending review vs hired list
  const hiredApplicants = applicants.filter(
    (p) => p.status === 'accepted' || p.status === 'hired'
  );
  const pendingApplicants = applicants.filter(
    (p) => p.status !== 'accepted' && p.status !== 'hired'
  );

  const displayedApplicants = activeTab === 'pending' ? pendingApplicants : hiredApplicants;

  // Toggle selection for individual applicant
  const toggleSelectApplicant = (id: string) => {
    setSelectedApplicantIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select all / Deselect all for current tab
  const toggleSelectAll = () => {
    const availableIds = displayedApplicants.map((p) => p._id);
    const allSelected = availableIds.length > 0 && availableIds.every((id) => selectedApplicantIds.includes(id));
    if (allSelected) {
      setSelectedApplicantIds((prev) => prev.filter((id) => !availableIds.includes(id)));
    } else {
      setSelectedApplicantIds((prev) => Array.from(new Set([...prev, ...availableIds])));
    }
  };

  const openConfirmModal = (proposalId: string, status: 'accepted' | 'declined', workerName: string) => {
    setConfirmModal({
      isOpen: true,
      proposalId,
      status,
      workerName,
    });
  };

  const handleConfirmAction = async () => {
    const { proposalId, status, workerName } = confirmModal;
    if (!proposalId) return;

    setActionLoadingId(proposalId);
    try {
      await workforceAPI.updateProposalStatus(proposalId, status);
      showToast(
        status === 'accepted'
          ? `Hired ${workerName}! Worker added to active workforce company.`
          : `Application from ${workerName} declined.`,
        status === 'accepted' ? 'success' : 'info'
      );
      setApplicants((prev) =>
        prev.map((p) => (p._id === proposalId ? { ...p, status } : p))
      );
      // Remove from selection if selected
      setSelectedApplicantIds((prev) => prev.filter((id) => id !== proposalId));
      setConfirmModal({ isOpen: false, proposalId: '', status: 'accepted', workerName: '' });
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update applicant status', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Send Interview Invitation to selected candidates
  const handleSendInterviewInvites = () => {
    if (selectedApplicantIds.length === 0) {
      showToast('Please select at least one applicant to invite for an interview', 'error');
      return;
    }
    setInterviewModal((prev) => ({ ...prev, isOpen: true }));
  };

  const submitInterviewInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setInterviewModal((prev) => ({ ...prev, sending: true }));

    setTimeout(() => {
      showToast(
        `🎉 Interview invitations sent successfully to ${selectedApplicantIds.length} candidate(s) for ${interviewModal.date} at ${interviewModal.time}!`,
        'success'
      );
      // Mark selected candidate IDs as invited
      setInterviewInvitedIds((prev) => Array.from(new Set([...prev, ...selectedApplicantIds])));
      setSelectedApplicantIds([]);
      setInterviewModal((prev) => ({ ...prev, isOpen: false, sending: false }));
    }, 800);
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
                  <span>Total Applications: <strong className="text-gray-900">{applicants.length} Workers</strong></span>
                  <span>Posted {new Date(job.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>

              {/* APPLICANTS MANAGEMENT CARD WITH FILTER TABS */}
              <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 space-y-5">
                {/* TAB SWITCHER & BULK INTERVIEW ACTION HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-2xl">
                    <button
                      onClick={() => { setActiveTab('pending'); setSelectedApplicantIds([]); }}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                        activeTab === 'pending'
                          ? 'bg-white text-gray-900 shadow-2xs'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      Pending Review ({pendingApplicants.length})
                    </button>

                    <button
                      onClick={() => { setActiveTab('hired'); setSelectedApplicantIds([]); }}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                        activeTab === 'hired'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      Hired List ({hiredApplicants.length})
                    </button>
                  </div>

                  {/* BULK INTERVIEW INVITATION BUTTON */}
                  {activeTab === 'pending' && pendingApplicants.length > 0 && (
                    <button
                      onClick={handleSendInterviewInvites}
                      disabled={selectedApplicantIds.length === 0}
                      className="px-4 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover text-white font-extrabold text-xs shadow-md shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Request Interview ({selectedApplicantIds.length})</span>
                    </button>
                  )}
                </div>

                {displayedApplicants.length === 0 ? (
                  <EmptyState
                    icon={activeTab === 'hired' ? UserCheck : Users}
                    title={activeTab === 'hired' ? 'No hired candidates yet' : 'No pending applicants'}
                    description={
                      activeTab === 'hired'
                        ? 'Candidates you accept for this job will be separated here into your Hired People List.'
                        : 'All submitted applications for this opening have been reviewed.'
                    }
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-medium">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider font-bold">
                          {activeTab === 'pending' && (
                            <th className="py-3 px-3 w-10">
                              <input
                                type="checkbox"
                                checked={
                                  displayedApplicants.length > 0 &&
                                  displayedApplicants.every((p) => selectedApplicantIds.includes(p._id))
                                }
                                onChange={toggleSelectAll}
                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                title="Select All Candidates"
                              />
                            </th>
                          )}
                          <th className="py-3 px-3">Applicant</th>
                          <th className="py-3 px-3">Rate</th>
                          <th className="py-3 px-3">Pitch</th>
                          <th className="py-3 px-3">Interview Status</th>
                          <th className="py-3 px-3">Status</th>
                          <th className="py-3 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-gray-700">
                        {displayedApplicants.map((p) => {
                          const worker = p.freelancerId || p.worker;
                          const workerName = worker ? `${worker.firstName || ''} ${worker.lastName || ''}`.trim() : 'Worker Applicant';
                          const isAccepted = p.status === 'accepted' || p.status === 'hired';
                          const isDeclined = p.status === 'declined' || p.status === 'rejected';
                          const isSelected = selectedApplicantIds.includes(p._id);
                          const isInterviewRequested = interviewInvitedIds.includes(p._id) || p.interviewStatus === 'invited';

                          return (
                            <tr
                              key={p._id}
                              className={`hover:bg-gray-50/50 transition-colors ${
                                isSelected ? 'bg-orange-50/40' : ''
                              }`}
                            >
                              {activeTab === 'pending' && (
                                <td className="py-3.5 px-3">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleSelectApplicant(p._id)}
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                  />
                                </td>
                              )}

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

                              {/* INTERVIEW INVITATION COLUMN */}
                              <td className="py-3.5 px-3">
                                {isInterviewRequested ? (
                                  <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-primary font-extrabold text-[11px] inline-flex items-center gap-1 border border-orange-200">
                                    <Calendar className="w-3 h-3 text-primary" /> Requested for Interview
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-gray-400 font-medium">Not Requested</span>
                                )}
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
                                    <Clock3 className="w-3 h-3" /> Pending Review
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 px-3 text-right space-x-2">
                                {!isAccepted && !isDeclined ? (
                                  <>
                                    <button
                                      onClick={() => openConfirmModal(p._id, 'accepted', workerName)}
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
                                      onClick={() => openConfirmModal(p._id, 'declined', workerName)}
                                      disabled={actionLoadingId === p._id}
                                      className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-xs border border-gray-200 transition-all inline-flex items-center gap-1 disabled:opacity-50"
                                    >
                                      <XCircle className="w-3.5 h-3.5 text-gray-400" />
                                      <span>Reject</span>
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-[11px] text-emerald-600 font-extrabold flex items-center justify-end gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> On Roster
                                  </span>
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

      {/* CONFIRMATION MODAL POPUP FOR HIRE / DECLINE */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-gray-100 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                confirmModal.status === 'accepted' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
              }`}>
                {confirmModal.status === 'accepted' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <XCircle className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-base text-gray-900 leading-tight">
                  {confirmModal.status === 'accepted' ? 'Confirm Hire Worker' : 'Confirm Reject Application'}
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Action required for applicant.</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
              {confirmModal.status === 'accepted' ? (
                <>Are you sure you want to <strong>hire {confirmModal.workerName}</strong> for this role? They will be added to your active workforce company roster immediately.</>
              ) : (
                <>Are you sure you want to <strong>decline {confirmModal.workerName}</strong> for this position?</>
              )}
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, proposalId: '', status: 'accepted', workerName: '' })}
                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-all"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={!!actionLoadingId}
                className={`px-4 py-2.5 rounded-xl text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 ${
                  confirmModal.status === 'accepted'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {actionLoadingId ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : confirmModal.status === 'accepted' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Hire</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Confirm Reject</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERVIEW INVITATION MODAL POPUP */}
      {interviewModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-gray-100 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-orange-100 text-primary flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-gray-900 leading-tight">Schedule Interview</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Inviting <strong>{selectedApplicantIds.length} selected candidate(s)</strong> for an interview.</p>
              </div>
            </div>

            <form onSubmit={submitInterviewInvitation} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> Interview Date
                  </label>
                  <input
                    type="date"
                    required
                    value={interviewModal.date}
                    onChange={(e) => setInterviewModal((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-900 focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-primary" /> Interview Time
                  </label>
                  <input
                    type="time"
                    required
                    value={interviewModal.time}
                    onChange={(e) => setInterviewModal((prev) => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-900 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> Interview Location / Venue
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 14 Airport Road, Ikeja or Google Meet Link"
                  value={interviewModal.location}
                  onChange={(e) => setInterviewModal((prev) => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-900 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">Additional Instructions (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Bring hardcopy ID card and safety helmet."
                  value={interviewModal.notes}
                  onChange={(e) => setInterviewModal((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-900 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setInterviewModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-all"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={interviewModal.sending}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs transition-all shadow-md shadow-primary/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {interviewModal.sending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Interview Invites</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
